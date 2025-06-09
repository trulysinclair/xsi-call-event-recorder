import {exists,} from '@std/fs'
import {Buffer} from "node:buffer";

const XSI_USERNAME = Deno.env.get("XSI_USERNAME");
const XSI_PASSWORD = Deno.env.get("XSI_PASSWORD");
const XSI_HOSTNAME = Deno.env.get("XSI_HOSTNAME");
const HTTP_CONTACT = Deno.env.get("HTTP_CONTACT");

const requestSubscription = (userId: string) =>
  fetch(
    `https://${XSI_HOSTNAME}/com.broadsoft.xsi-events/v2.0/user/${userId}`,
    {
      headers: {
        Authorization: `Basic ${
          Buffer.from(
            `${XSI_USERNAME}:${XSI_PASSWORD}`,
          ).toString("base64")
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        Subscription: {
          "@xmlns": {
            $: "http://schema.broadsoft.com/xsi",
          },
          subscriberId: {
            $: userId,
          },
          targetIdType: {
            $: "User",
          },
          targetId: {
            $: userId,
          },
          event: {
            $: "Advanced Call",
          },
          expires: {
            $: "86400",
          },
          httpContact: {
            uri: {
              $: HTTP_CONTACT,
            },
          },
          applicationId: {
            $: "event-listener",
          },
        },
      }),
    },
  );

for (const arg of Deno.args) {
  console.log(`Requesting event subscription for ${arg}`);
  const response = await requestSubscription(String(arg));
  const status = response.status;

  switch (status) {
    case 200:
      console.log(`${arg}: Approved`);
      break;
    case 403:
      console.log(`${arg}: Denied - Unauthorized`);
      break;
    default:
      console.log(`${arg}: Unknown - ${await response.text()}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const separator = new Array(80).fill("=").join("") + "\n";
    const text = await req.text();

    if (!await exists("tmp")) {
      await Deno.mkdir("tmp");
    }

    await Deno.writeTextFile("tmp/raw.txt", separator + text + "\n", {
      append: true,
    });
  }

  return new Response();
});
