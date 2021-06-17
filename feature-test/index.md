---
order: 1
description: Test our features
---

# Feature test

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
