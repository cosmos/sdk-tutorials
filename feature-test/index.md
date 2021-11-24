---
order: 1
description: Test our features
---

# Feature test

## Video

<YoutubePlayer videoId="6bq-JaViGRM"/>

## Expansion Panel
<ExpansionPanel title="Title test">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc aliquet ligula sed dolor tincidunt, vel pulvinar risus faucibus. Donec in sodales turpis, faucibus aliquet quam. Sed faucibus ac arcu et sollicitudin. Nam mauris nisl, pulvinar at tempus vel, molestie quis est. Maecenas efficitur, neque sed varius cursus, magna ligula facilisis ex, non gravida eros lacus sed odio. Suspendisse lacus risus, feugiat vitae commodo sit amet, vestibulum in nulla. Morbi accumsan massa nisi, non feugiat ex tristique non. Praesent pharetra nisl tincidunt nunc tincidunt venenatis. Proin finibus luctus porttitor. Aenean mauris nibh, ultrices ac tellus ac, congue vehicula velit. Duis posuere vestibulum ante, nec dignissim leo scelerisque at. Phasellus id mi at nisi rutrum tristique. Sed malesuada finibus gravida. Nullam eu est consequat, egestas velit in, blandit sem.

</ExpansionPanel>

## Code group


```py [https://github.com/cosmos/cosmos-sdk/blob/master/scripts/linkify_changelog.py]
for line in fileinput.input(inplace=1):
    line = re.sub(r"\s\\#([0-9]+)", r" [\\#\1](https://github.com/cosmos/cosmos-sdk/issues/\1)", line.rstrip())
    print(line)
```

<CodeGroup>
<CodeGroupItem title="JavaScript" active>

```js [https://github.com/cosmos/cosmos-sdk/blob/master/scripts/linkify_changelog.py]
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

 Tip box description Tip box description  Tip box description Tip box description Tip box description Tip box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description

</HighlightBox>

<HighlightBox type="warn">

Warning box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description

</HighlightBox>

<HighlightBox type="reading">

Reading box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description escription Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description Tip box description

</HighlightBox>

## H5P

### Single component

<H5PComponent :contents="['/h5p/test-arithmetic-quiz']"></H5PComponent>

### Multiple components

<H5PComponent :contents="['/h5p/test-memory-game', '/h5p/test-arithmetic-quiz']"></H5PComponent>
