---
order: 1
description: Test our features
---

# Feature test

## Code group

<CodeGroup>
<CodeGroupItem title="JavaScript" active>

```js
import { SpH3, SpButton } from "@tendermint/vue";

export default {
  components: {
    SpH3,
    SpButton,
  },
  data() {
    return {
      placeholderText: "Drag and drop a file here",
      hashed: "",
      flight: false,
    };
  },
  methods: {
    hash(e) {},
    async submit() {},
  }
}
```

</CodeGroupItem>
<CodeGroupItem title="TypeScript">

```ts
import * as CSS from 'csstype';

const style: CSS.Properties = {
  colour: 'white', // Type error on property
  textAlign: 'middle', // Type error on value
};
```

</CodeGroupItem>
<CodeGroupItem title="go">

```go
// OnTimeoutIbcPostPacket responds to the case where a packet has not been transmitted because of a timeout
func (k Keeper) OnTimeoutIbcPostPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcPostPacketData) error {
    k.AppendTimedoutPost(
        ctx,
        types.TimedoutPost{
            Creator: data.Creator,
            Title: data.Title,
            Chain: packet.DestinationPort+"-"+packet.DestinationChannel,
        },
    )

    return nil
}
```

</CodeGroupItem>
</CodeGroup>

## Highlight boxes

<HighlightBox type="info">

Info box description

</HighlightBox>

<HighlightBox type="tip">

Tip box description

</HighlightBox>

<HighlightBox type="warn">

Warning box description

</HighlightBox>

<HighlightBox type="reading">

Reading box description

</HighlightBox>

## H5P

### Single component

<H5PComponent :contents="['/h5p/test-arithmetic-quiz']"></H5PComponent>

### Multiple components

<H5PComponent :contents="['/h5p/test-memory-game', '/h5p/test-arithmetic-quiz']"></H5PComponent>
