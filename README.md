# XSI Call Event Recorder

These Deno scripts allow you to subscribe to a Cisco Broadworks Xtended Services Interface on a specific user, for Advanced Call Events. 

You can do the following:

1. [Record Events](#1-record-events)
2. [Transform Events](#2-transform-events)

## 1. Record Events

Record raw event data to a plain text file, each event split by a separator for clarity. They are not cleaned up, instead leaving that for transformation, but you can read them if you need to at this stage.

**Permissions:**

- **W**rites to `tmp/events.txt`
- **E**nv variables: `XSI_HOSTNAME`, `XSI_USERNAME`, `XSI_PASSWORD`, `HTTP_CONTACT`
- **N**etwork request to the XSI server at `https://${XSI_HOSTNAME}/com.broadsoft.xsi-events/v2.0/user/${userId}`

```bash
deno record wile.e.coyote@acme.com
```

## 2. Transform Events

Transform the raw xml payloads into clean JSON.

**Permissions:**

- **R**eads from `tmp/events.txt`
- **W**rites to `tmp/events.json`

```bash
deno transform
```

## 3. Convert to YAML (optional)

If you feel like YAML is more usable.

**Permissions:**

- **R**eads from `tmp/events.json`
- **W**rites to `tmp/events.yml`

```bash
deno convert
```