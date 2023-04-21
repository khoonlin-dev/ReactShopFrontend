import { ChangeEventHandler, FormEventHandler, useState } from "react";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormGroup,
    Input,
    Label,
} from "reactstrap";
import { SearchOptions } from "../../../state/state";

function titleCase(str: string) {
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

function GenerateDropDown({
    id,
    title,
    disabled,
    placeholder,
    rows,
    name,
}: {
    id: string;
    title: string;
    placeholder: string;
    disabled: boolean;
    name: string;
    rows: Record<string, string>;
}) {
    return (
        <FormGroup>
            <Label for={id}>{title}</Label>
            <Input
                id={id}
                name={name}
                type="select"
                placeholder={placeholder}
                disabled={disabled}
                defaultValue={""}
            >
                <option value="" key="empty">
                    {"Any"}
                </option>
                {Object.keys(rows).map((key) => {
                    const value = rows[key];
                    return (
                        <option value={key} key={key}>
                            {value}
                        </option>
                    );
                })}
            </Input>
        </FormGroup>
    );
}

export default function Search({
    disabled,
    searchOptions,
    onSubmit,
}: {
    disabled: boolean;
    searchOptions: Partial<SearchOptions>;
    onSubmit: (param: never) => void;
}) {
    return (
        <div className="browse-search">
            <h3 className="browse-title">Search Filter</h3>
            <Form onSubmit={onSubmit}>
                <FormGroup>
                    <Label for={"model"}>Model</Label>
                    <Input
                        id="model"
                        name="model"
                        placeholder="Enter Product Name"
                        disabled={disabled}
                    ></Input>
                </FormGroup>
                {Object.entries(searchOptions).map(([key, info]) => {
                    const title = titleCase(key);
                    return (
                        <GenerateDropDown
                            id={`${key}-select`}
                            key={`${key}-select`}
                            name={key}
                            title={title}
                            placeholder={`Select ${title} Dropdown`}
                            disabled={disabled}
                            rows={info}
                        />
                    );
                })}
                <Button
                    type="submit"
                    style={{ width: "100%" }}
                    disabled={disabled}
                >
                    Search
                </Button>
            </Form>{" "}
        </div>
    );
}
