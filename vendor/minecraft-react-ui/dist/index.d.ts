import { default as default_2 } from 'react';
import { Placement } from '@floating-ui/react-dom';
import * as React_2 from 'react';

export declare const Button: React_2.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & React_2.RefAttributes<HTMLButtonElement>>;

export declare const ButtonGroup: {
    ({ options, disabled, className, onChange, value }: ButtonGroupProps): React_2.JSX.Element;
    displayName: string;
};

declare type ButtonGroupOptionProps = ButtonProps & {
    value: string;
    label: string;
};

export declare type ButtonGroupProps = {
    value: string;
    onChange?: (value: string) => void;
    options: Array<ButtonGroupOptionProps>;
    disabled?: boolean;
    className?: string;
};

export declare interface ButtonProps extends default_2.HTMLProps<HTMLButtonElement> {
    children?: default_2.ReactNode;
    onClick?: (event: default_2.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    disabled?: boolean;
    active?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "clear";
}

export declare const Checkbox: React_2.ForwardRefExoticComponent<Omit<CheckboxProps, "ref"> & React_2.RefAttributes<HTMLInputElement>>;

export declare const CheckboxGroup: React_2.ForwardRefExoticComponent<Omit<CheckboxGroupProps, "ref"> & React_2.RefAttributes<HTMLDivElement>>;

export declare type CheckboxGroupOption = {
    label: string;
    value: string;
    disabled?: boolean;
    readOnly?: boolean;
};

export declare type CheckboxGroupProps = Omit<React_2.HTMLProps<HTMLDivElement>, "onChange" | "value"> & {
    name: string;
    value?: Array<string>;
    onChange: (value: Array<string>, event: React_2.ChangeEvent<HTMLInputElement>) => void;
    options: Array<CheckboxGroupOption>;
    className?: string;
    direction?: "row" | "column";
    showSelectAll?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
};

export declare type CheckboxProps = Omit<React_2.HTMLProps<HTMLInputElement>, "onChange" | "value"> & {
    value?: boolean;
    onChange: (value: boolean, event: React_2.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    indeterminate?: boolean;
    className?: string;
    label?: string;
};

export declare const Dropdown: ({ content, target, placement, closeOnClickContent, closeOnClickOutside, trigger, }: DropdownProps) => default_2.JSX.Element;

export declare const DropdownMenu: ({ items, placement, className, onClick, tabIndex, }: MenuProps & ButtonProps & {
    placement?: DropdownProps["placement"];
}) => default_2.JSX.Element;

export declare type DropdownMenuProps = MenuProps & ButtonProps & DropdownProps;

export declare type DropdownProps = {
    content: default_2.ReactNode;
    target: Target;
    closeOnClickContent?: boolean;
    closeOnClickOutside?: boolean;
    placement?: Placement;
    trigger?: "click" | "hover";
};

export declare type DropdownTargetProps = {
    open: () => void;
    close: () => void;
    visible: boolean;
    ref: default_2.LegacyRef<HTMLDivElement> | undefined;
    className: string;
};

export declare const FlexBox: ({ direction, align, justify, className, style, children, }: FlexBoxProps) => React_2.JSX.Element;

export declare type FlexBoxProps = {
    direction?: "row" | "col";
    align?: "flex-start" | "flex-end" | "center" | "stretch";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
    wrap?: "wrap" | "nowrap";
    className?: string;
    style?: React_2.CSSProperties;
    children: React_2.ReactNode;
};

export declare const Input: React_2.ForwardRefExoticComponent<Omit<InputProps, "ref"> & React_2.RefAttributes<HTMLInputElement>>;

export declare type InputProps = Omit<React_2.HTMLProps<HTMLInputElement>, "onChange"> & {
    onChange: (value: string, event?: React_2.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
};

export declare type Item = {
    id: string;
    [key: string]: any;
};

export declare const List: React_2.ForwardRefExoticComponent<ListProps & React_2.RefAttributes<HTMLUListElement>>;

export declare type ListItemProps = Omit<default_2.HTMLProps<HTMLLIElement>, "data"> & {
    children?: default_2.ReactNode;
    className?: string;
    index: number;
    item: Item;
    dragging?: boolean;
};

declare type ListItemSelectionProps = {
    toggle: () => void;
    selected: boolean;
    selectedIds: Array<Item["id"]>;
    disabled: boolean;
};

export declare type ListMenuProps = Omit<MenuProps, "items"> & {
    items: (item?: Item) => MenuProps["items"];
};

export declare type ListProps = {
    className?: string;
    children?: default_2.ReactNode;
    items: Array<Item>;
    menu?: ListMenuProps;
    search?: ListSearchProps;
    selection?: ListSelectionProps;
    renderItem: (renderItemProps: RenderItemProps) => default_2.ReactNode;
    direction?: "row" | "column";
    draggable?: boolean;
    itemSize?: number;
};

export declare type ListSearchContextValue = ListSearchProps & {
    onChange: (keywords: string) => void;
    keywords: string;
    next: (event: default_2.KeyboardEvent<HTMLInputElement>) => void;
    prev: (event: default_2.KeyboardEvent<HTMLInputElement>) => void;
    currentResultItemIndex: number;
};

export declare type ListSearchProps = {
    searchItem: (item: Item, keywords: string) => boolean;
};

export declare type ListSelectionContextValue = {
    itemSelected?: (item: Item) => ListItemSelectionProps["selected"];
    itemDisabled?: (item: Item) => ListItemSelectionProps["disabled"];
    selectedIds: Array<Item["id"]>;
    setSelectedIds: (selectedIds: Array<Item["id"]>) => void;
};

export declare type ListSelectionProps = {
    itemDisabled?: (item: Item) => ListItemSelectionProps["disabled"];
    initialSelectedIds?: Array<Item["id"]>;
};

export declare const Menu: React_2.ForwardRefExoticComponent<MenuProps & React_2.RefAttributes<HTMLDivElement>>;

export declare const MenuIcon: ({ className }: MenuIconProps) => React_2.JSX.Element;

export declare type MenuIconProps = {
    className?: string;
};

export declare const MenuItem: ({ label, onClick, disabled, ...rest }: MenuItemProps) => React_2.JSX.Element;

export declare type MenuItemProps = React_2.HTMLAttributes<HTMLDivElement> & {
    id: string;
    label: React_2.ReactNode;
    onClick?: (event: React_2.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    disabled?: boolean;
};

export declare type MenuProps = {
    items: Array<MenuItemProps>;
};

export declare const Radio: React_2.ForwardRefExoticComponent<Omit<RadioProps, "ref"> & React_2.RefAttributes<HTMLInputElement>>;

export declare const RadioGroup: React_2.ForwardRefExoticComponent<Omit<RadioGroupProps, "ref"> & React_2.RefAttributes<HTMLDivElement>>;

export declare type RadioGroupOption = {
    label: string;
    value: string;
    disabled?: boolean;
    readOnly?: boolean;
};

export declare type RadioGroupProps = Omit<React_2.HTMLProps<HTMLDivElement>, "onChange" | "value"> & {
    name: string;
    value: string | undefined;
    onChange: (value: string, event: React_2.ChangeEvent<HTMLInputElement>) => void;
    options: Array<RadioGroupOption>;
    className?: string;
    direction?: "row" | "column";
    disabled?: boolean;
    readOnly?: boolean;
};

export declare type RadioProps = Omit<React_2.HTMLProps<HTMLInputElement>, "onChange" | "value"> & {
    value?: string;
    checked?: boolean;
    onChange: (value: string, event: React_2.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    indeterminate?: boolean;
    className?: string;
};

export declare type RenderItemProps = {
    item: Item;
    index: number;
    data?: RenderItemPropsData;
};

declare type RenderItemPropsData = {
    items: Array<Item>;
    draggable?: boolean;
    selection?: ListItemSelectionProps;
};

export declare const Select: ({ className, disabled, options, value, placeholder, searchPlaceholder, onChange, onFocus, onBlur, }: SelectProps) => default_2.JSX.Element;

export declare type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

export declare type SelectProps = {
    value?: string;
    options: Array<SelectOption>;
    onChange: (value?: string) => void;
    onFocus?: (event: default_2.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: default_2.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
};

export declare const Slider: {
    ({ disabled, className, value, onChange, min, max, }: SliderProps): React_2.JSX.Element;
    displayName: string;
};

export declare type SliderProps = {
    children?: React_2.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
};

export declare const Switch: React_2.ForwardRefExoticComponent<Omit<SwitchProps, "ref"> & React_2.RefAttributes<HTMLInputElement>>;

export declare type SwitchProps = Omit<React_2.HTMLProps<HTMLInputElement>, "onChange" | "value"> & {
    value: boolean;
    onChange: (value: boolean, event: React_2.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    indeterminate?: boolean;
    className?: string;
    label?: string;
};

export declare const Tag: ({ className, children }: TagProps) => React_2.JSX.Element;

export declare type TagProps = {
    className?: string;
    children: React_2.ReactNode;
};

declare type Target = default_2.ReactElement<any, string | default_2.JSXElementConstructor<any>> | TargetFunction;

declare type TargetFunction = (targetProps: DropdownTargetProps) => default_2.ReactNode;

export declare const Tooltip: default_2.ForwardRefExoticComponent<TooltipProps & default_2.RefAttributes<unknown>>;

declare type TooltipProps = {
    content: default_2.ReactNode;
    children: default_2.ReactNode;
    placement?: Placement;
    trigger?: "hover" | "click";
};

export { }
