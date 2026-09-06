# Minecraft React UI - Usage Guide

## Installation

```bash
npm install minecraft-react-ui
```

Peer dependencies: `react` and `react-dom` (18 or 19).

## Quick Start

### 1. Import styles

In your app's entry file (e.g. `main.tsx` or `App.tsx`):

```tsx
import "minecraft-react-ui/style.css";
```

This loads all component styles + the Minecraft CSS variables (colors, fonts, etc.).

### 2. Use components

```tsx
import { Button, Tag } from "minecraft-react-ui";

function App() {
  return (
    <div>
      <Button variant="primary">Hello!</Button>
      <Tag>v1.0</Tag>
    </div>
  );
}
```

### 3. Font (optional)

The library uses the Minecraft / Minercraftory font. To match the pixel-art look,
add this to your `index.html`:

```html
<style>
  @import url("https://fonts.cdnfonts.com/css/minercraftory");
</style>
```

---

## Theming via CSS Variables

All colors are controlled by CSS custom properties on `:root`. Override them to
customise the palette:

```css
:root {
  --background-color: #23232a;
  --primary-color: #3b8526;
  --primary-color-hover: #50ad2e;
  --secondary-color: #d0d1d4;
  --accent-color: #2e6be5;
  --text-color: #fff;
  --text-color-invert: #23232a;
  --foreground-color: #8b8b8b;
  --midground-color: #484848;
  /* ...and more, see src/styles/minecraft-ui.css for the full list */
}
```

---

## Components

### Button

A styled `<button>` with Minecraft bezel shadow.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "clear"` | `"secondary"` | Visual style |
| `active` | `boolean` | `false` | Active/pressed state |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | — | Extra CSS class |
| `type` | `"button" \| "submit" \| "reset"` | — | Button HTML type |

```tsx
import { Button } from "minecraft-react-ui";

<Button variant="primary" onClick={() => alert("clicked!")}>
  Primary Action
</Button>

<Button variant="secondary">Default</Button>
<Button variant="clear">Ghost button</Button>
<Button active>Currently active</Button>
<Button disabled>Can't click me</Button>
```

---

### ButtonGroup

A controlled segmented toggle. Selects one option from a list.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Currently selected value (controlled) |
| `onChange` | `(value: string) => void` | — | Called when selection changes |
| `options` | `Array<{ value: string; label: string; ... }>` | — | Available options |
| `disabled` | `boolean` | `false` | Disable all buttons |

```tsx
import { ButtonGroup } from "minecraft-react-ui";
import { useState } from "react";

function ViewToggle() {
  const [view, setView] = useState("grid");

  return (
    <ButtonGroup
      value={view}
      onChange={setView}
      options={[
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
        { value: "detail", label: "Detail" },
      ]}
    />
  );
}
```

---

### Input

A text input that simplifies `onChange` — the callback receives the string value
directly instead of the raw event.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Input value (controlled) |
| `onChange` | `(value: string, event?) => void` | — | Fires with the string value |
| `disabled` | `boolean` | — | Disabled |
| `placeholder` | `string` | — | Placeholder text |

```tsx
import { Input } from "minecraft-react-ui";
import { useState } from "react";

function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <Input
      value={query}
      onChange={setQuery}
      placeholder="Search..."
    />
  );
}
```

All other standard `<input>` props (`type`, `onKeyDown`, `onFocus`, etc.) are
forwarded.

---

### Checkbox

A styled checkbox. `onChange` fires with the boolean `checked` value, not the
raw event.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | — | Whether checked (controlled) |
| `onChange` | `(checked: boolean, event) => void` | — | Fires with new checked state |
| `indeterminate` | `boolean` | `false` | Show indeterminate (minus) state |
| `disabled` | `boolean` | — | Disabled |

```tsx
import { Checkbox, Tag } from "minecraft-react-ui";
import { useState } from "react";

function Consent() {
  const [accepted, setAccepted] = useState(false);

  return (
    <label>
      <Checkbox value={accepted} onChange={setAccepted} />
      I agree to the terms
    </label>
  );
}
```

---

### Radio

A styled radio button. Same `onChange` pattern as Checkbox.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | The radio's value |
| `checked` | `boolean` | — | Whether selected |
| `onChange` | `(value: string, event) => void` | — | Fires with the radio's value |
| `disabled` | `boolean` | — | Disabled |

```tsx
import { Radio } from "minecraft-react-ui";

<Radio value="a" checked={selected === "a"} onChange={setSelected} />
<Radio value="b" checked={selected === "b"} onChange={setSelected} />
```

---

### Switch

A toggle switch (rendered as a styled checkbox). Same API as Checkbox.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | — | Whether on (controlled) |
| `onChange` | `(value: boolean, event) => void` | — | Fires with new state |
| `disabled` | `boolean` | — | Disabled |

```tsx
import { Switch, Tag } from "minecraft-react-ui";
import { useState } from "react";

function Toggle() {
  const [on, setOn] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch value={on} onChange={setOn} />
      <Tag>{on ? "ON" : "OFF"}</Tag>
    </div>
  );
}
```

---

### CheckboxGroup

A group of checkboxes with multi-select.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Group name for HTML IDs |
| `value` | `string[]` | — | Selected values (controlled) |
| `onChange` | `(value: string[], event) => void` | — | Fires with updated array |
| `options` | `Array<{ label: string; value: string; disabled? }>` | — | Checkbox options |
| `showSelectAll` | `boolean` | `false` | Show "Select all" checkbox |
| `direction` | `"row" \| "column"` | `"column"` | Layout direction |
| `disabled` | `boolean` | — | Disable all |

```tsx
import { CheckboxGroup } from "minecraft-react-ui";
import { useState } from "react";

function Permissions() {
  const [perms, setPerms] = useState<string[]>(["read"]);

  return (
    <CheckboxGroup
      name="permissions"
      value={perms}
      onChange={setPerms}
      showSelectAll
      options={[
        { label: "Read", value: "read" },
        { label: "Write", value: "write" },
        { label: "Delete", value: "delete" },
      ]}
    />
  );
}
```

---

### RadioGroup

A group of radio buttons with single-select.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Group name |
| `value` | `string \| undefined` | — | Selected value (controlled) |
| `onChange` | `(value: string, event) => void` | — | Fires with selected value |
| `options` | `Array<{ label: string; value: string; disabled? }>` | — | Radio options |
| `direction` | `"row" \| "column"` | `"column"` | Layout direction |
| `disabled` | `boolean` | — | Disable all |

```tsx
import { RadioGroup } from "minecraft-react-ui";
import { useState } from "react";

function Difficulty() {
  const [level, setLevel] = useState("normal");

  return (
    <RadioGroup
      name="difficulty"
      value={level}
      onChange={setLevel}
      options={[
        { label: "Easy", value: "easy" },
        { label: "Normal", value: "normal" },
        { label: "Hard", value: "hard" },
      ]}
    />
  );
}
```

---

### Slider

A draggable value slider with Minecraft pixel-art rail styling.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value (controlled) |
| `onChange` | `(value: number) => void` | — | Fires on drag/click |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | — | Step increment |
| `disabled` | `boolean` | — | Disabled |

```tsx
import { Slider, Tag } from "minecraft-react-ui";
import { useState } from "react";

function VolumeControl() {
  const [vol, setVol] = useState(75);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Slider value={vol} min={0} max={100} onChange={setVol} />
      <Tag>{vol}%</Tag>
    </div>
  );
}
```

---

### Select

A searchable dropdown select with Minecraft styling. Uses a Dropdown + Input +
Menu internally.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | — | Selected value (controlled) |
| `onChange` | `(value?: string) => void` | — | Called with value or `undefined` (clear) |
| `options` | `Array<{ label: string; value: string; disabled? }>` | — | Selectable options |
| `placeholder` | `string` | — | Placeholder when no selection |
| `searchPlaceholder` | `string` | — | Placeholder while search is active |
| `disabled` | `boolean` | — | Disabled |

```tsx
import { Select } from "minecraft-react-ui";
import { useState } from "react";

function BlockPicker() {
  const [block, setBlock] = useState<string | undefined>();

  return (
    <Select
      value={block}
      onChange={setBlock}
      placeholder="Choose a block..."
      searchPlaceholder="Search blocks..."
      options={[
        { label: "Oak Planks", value: "oak_planks" },
        { label: "Stone Bricks", value: "stone_bricks" },
        { label: "Nether Brick", value: "nether_brick" },
        { label: "End Stone", value: "end_stone" },
      ]}
    />
  );
}
```

Click the arrow button or the input to open. Type to filter. Click an option
to select. Click the X button to clear.

---

### Tooltip

Renders a floating tooltip on hover or click.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | — | Tooltip content (required) |
| `children` | `ReactNode` | — | The trigger element (required) |
| `placement` | `Placement` | `"bottom"` | Position: `top`, `bottom`, `left`, `right`, etc. |
| `trigger` | `"hover" \| "click"` | `"hover"` | How to activate |

```tsx
import { Tooltip, Button } from "minecraft-react-ui";

<Tooltip content="This is a helpful tip!" placement="top">
  <Button variant="secondary">Hover me</Button>
</Tooltip>

<Tooltip content="Click to dismiss" trigger="click" placement="right">
  <Button variant="secondary">Click me</Button>
</Tooltip>
```

Placement values: `top`, `top-start`, `top-end`, `bottom`, `bottom-start`,
`bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`,
`right-end`.

---

### Dropdown

A generic floating dropdown. Renders `content` relative to `target` using
Floating UI positioning.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `ReactNode \| (props) => ReactNode` | — | The trigger element |
| `content` | `ReactNode` | — | Floating panel content |
| `placement` | `Placement` | `"bottom-start"` | Where to position |
| `trigger` | `"click" \| "hover"` | `"click"` | Activation method |
| `closeOnClickOutside` | `boolean` | `false` | Close on outside click |
| `closeOnClickContent` | `boolean` | `false` | Close when content is clicked |

**Render-function target** — receive `open`, `close`, `visible`, `ref`:

```tsx
import { Dropdown } from "minecraft-react-ui";

<Dropdown
  placement="bottom-end"
  closeOnClickOutside
  closeOnClickContent
  target={({ ref, open, visible }) => (
    <button ref={ref} onClick={open} className={visible ? "active" : ""}>
      Open menu
    </button>
  )}
  content={<div>Dropdown content here</div>}
/>
```

---

### DropdownMenu

A pre-built dropdown with a three-dot menu icon (`⋮`) and a Menu inside.
Convenience component combining Dropdown + Menu.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItemProps[]` | — | Menu items (required) |
| `placement` | `Placement` | `"bottom-start"` | Dropdown position |
| `className` | `string` | — | Extra class on the menu button |

```tsx
import { DropdownMenu } from "minecraft-react-ui";

<DropdownMenu
  placement="bottom-end"
  items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", disabled: true },
    {
      id: "info",
      label: "Info",
      onClick: () => console.log("info clicked"),
    },
  ]}
/>
```

---

### Menu & MenuItem

A standalone vertical menu (used inside Dropdown, but can be used directly).

```tsx
import { Menu, MenuIcon } from "minecraft-react-ui";

<div style={{ display: "flex", gap: 8 }}>
  <MenuIcon />
  <Menu
    items={[
      { id: "cut", label: "Cut" },
      { id: "copy", label: "Copy" },
      { id: "paste", label: "Paste", disabled: true },
    ]}
  />
</div>
```

`MenuIcon` is a standalone hamburger icon component that can be placed next to a
Menu.

---

### Tag

An inline label/badge with pixel-art clip-path styling.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Label text (required) |
| `className` | `string` | Extra CSS class |

```tsx
import { Tag } from "minecraft-react-ui";

<Tag>v2.1.0</Tag>
<Tag className="Tag_success">Online</Tag>
```

---

### FlexBox

A flex layout container with named props for `flex-direction`, `justify-content`
and `align-items`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"row" \| "col"` | `"row"` | Flex direction |
| `justify` | `"flex-start" \| "flex-end" \| "center" \| "space-between" \| "space-around"` | `"flex-start"` | Justify-content |
| `align` | `"flex-start" \| "flex-end" \| "center" \| "stretch"` | `"flex-start"` | Align-items |
| `style` | `CSSProperties` | — | Inline styles |
| `className` | `string` | — | Extra class |
| `children` | `ReactNode` | — | Child content |

```tsx
import { FlexBox, Tag } from "minecraft-react-ui";

<FlexBox justify="space-between" align="center">
  <Tag>Left</Tag>
  <Tag>Right</Tag>
</FlexBox>

<FlexBox direction="col" style={{ gap: 8 }}>
  <div>Item 1</div>
  <div>Item 2</div>
</FlexBox>
```

---

### List

A virtualized, feature-rich list supporting drag-and-drop reordering, search
with next/prev navigation, multi-select with checkboxes, and per-item context
menus. Uses `@tanstack/react-virtual` + `@dnd-kit` internally.

**List container must have an explicit height** (via CSS on a parent or inline).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Item[]` | — | Array of items (each needs `id: string`) |
| `renderItem` | `(props: { item, index }) => ReactNode` | — | Custom render function |
| `itemSize` | `number` | `48` | Row height in px |
| `draggable` | `boolean` | `false` | Enable drag-and-drop reorder |
| `selection` | `ListSelectionProps` | — | Enable multi-select checkboxes |
| `search` | `ListSearchProps` | — | Enable search with custom matcher |
| `menu` | `ListMenuProps` | — | Per-item dropdown menu |
| `className` | `string` | — | Extra class |

**Basic list:**

```tsx
import { List, type Item } from "minecraft-react-ui";

const items: Item[] = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i}`,
}));

<div style={{ height: 400 }}>
  <List
    items={items}
    itemSize={48}
    renderItem={({ item }) => <span>{item.name}</span>}
  />
</div>
```

**Draggable list:**

```tsx
<List
  items={items}
  draggable
  itemSize={48}
  renderItem={({ item }) => <span>{item.name}</span>}
/>
```

**List with search:**

```tsx
<List
  items={items}
  itemSize={48}
  renderItem={({ item }) => <span>{item.name}</span>}
  search={{
    searchItem: (item, keywords) =>
      item.name.toLowerCase().includes(keywords.toLowerCase()),
  }}
/>
```

Use arrow keys / Enter to navigate search results. Shift+Enter or ArrowUp to
go to previous result.

**List with selection:**

```tsx
<List
  items={items}
  itemSize={48}
  renderItem={({ item }) => <span>{item.name}</span>}
  selection={{
    initialSelectedIds: ["item-0", "item-5"],
  }}
/>
```

**List with per-item menus:**

```tsx
<List
  items={items}
  itemSize={48}
  renderItem={({ item }) => <span>{item.name}</span>}
  menu={{
    items: (item) => [
      { id: `open-${item?.id}`, label: "Open" },
      { id: `delete-${item?.id}`, label: "Delete" },
    ],
  }}
/>
```

**Full-featured list (all features combined):**

```tsx
<div style={{ height: 500 }}>
  <List
    items={items}
    draggable
    itemSize={48}
    renderItem={({ item }) => (
      <div>
        <strong>{item.name}</strong> — {item.description}
      </div>
    )}
    search={{
      searchItem: (item, keywords) =>
        item.name.toLowerCase().includes(keywords.toLowerCase()),
    }}
    selection={{ initialSelectedIds: [] }}
    menu={{
      items: (item) => [
        { id: `${item?.id}-edit`, label: "Edit" },
        { id: `${item?.id}-delete`, label: "Delete" },
      ],
    }}
  />
</div>
```

---

## Full Example: A Simple App

```tsx
import React, { useState } from "react";
import {
  Button,
  ButtonGroup,
  Checkbox,
  Input,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tag,
  Tooltip,
  DropdownMenu,
  FlexBox,
} from "minecraft-react-ui";
import "minecraft-react-ui/style.css";

export default function App() {
  const [view, setView] = useState("grid");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("normal");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [material, setMaterial] = useState<string | undefined>();

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <FlexBox justify="space-between" align="center">
        <h1 style={{ margin: 0 }}>
          My Settings <Tag>1.0</Tag>
        </h1>
        <DropdownMenu
          items={[
            { id: "save", label: "Save" },
            { id: "reset", label: "Reset" },
          ]}
        />
      </FlexBox>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <Input value={name} onChange={setName} placeholder="Your name" />

        <FlexBox align="center" style={{ gap: 8 }}>
          <Tooltip content="Choose your difficulty" placement="right">
            <span>Difficulty</span>
          </Tooltip>
          <RadioGroup
            name="difficulty"
            value={level}
            onChange={setLevel}
            direction="row"
            options={[
              { label: "Easy", value: "easy" },
              { label: "Normal", value: "normal" },
              { label: "Hard", value: "hard" },
            ]}
          />
        </FlexBox>

        <ButtonGroup
          value={view}
          onChange={setView}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />

        <Select
          value={material}
          onChange={setMaterial}
          placeholder="Pick a material..."
          searchPlaceholder="Search..."
          options={[
            { label: "Oak Wood", value: "oak" },
            { label: "Cobblestone", value: "cobble" },
            { label: "Diamond", value: "diamond" },
          ]}
        />

        <FlexBox align="center" style={{ gap: 8 }}>
          <Switch value={muted} onChange={setMuted} />
          <span>{muted ? "Muted" : "Sound on"}</span>
        </FlexBox>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Slider value={volume} min={0} max={100} onChange={setVolume} />
          <Tag>{volume}%</Tag>
        </div>

        <Button variant="primary" onClick={() => alert("Saved!")}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
```

---

## API Reference Summary

| Component | Key Props |
|-----------|-----------|
| `Button` | `variant`, `active`, `disabled`, `onClick` |
| `ButtonGroup` | `value`, `onChange`, `options` |
| `Input` | `value`, `onChange(value, event)` |
| `Checkbox` | `value`, `onChange(checked, event)`, `indeterminate` |
| `Radio` | `value`, `checked`, `onChange(value, event)` |
| `Switch` | `value`, `onChange(checked, event)` |
| `CheckboxGroup` | `value[]`, `onChange(values[], event)`, `options`, `showSelectAll` |
| `RadioGroup` | `value`, `onChange(value, event)`, `options` |
| `Slider` | `value`, `onChange(num)`, `min`, `max` |
| `Select` | `value`, `onChange(val?)`, `options`, `placeholder` |
| `Tag` | `children`, `className` |
| `FlexBox` | `direction`, `justify`, `align` |
| `Tooltip` | `content`, `children`, `placement`, `trigger` |
| `Dropdown` | `target`, `content`, `placement`, `trigger` |
| `DropdownMenu` | `items`, `placement` |
| `Menu` / `MenuIcon` | `items` / `className` |
| `List` | `items`, `renderItem`, `draggable`, `search`, `selection`, `menu` |
