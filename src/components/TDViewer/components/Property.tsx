/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import React, { useContext, useState, useRef } from "react";
import { Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../../util.js";
import InfoIconWrapper from "../../InfoIcon/InfoIconWrapper";
import { getFormsTooltipContent } from "../../InfoIcon/TooltipMapper";
import Form from "./Form";
import AddFormDialog from "../../Dialogs/AddFormDialog";
import AddFormElement from "../base/AddFormElement";

const alreadyRenderedKeys = ["title", "forms", "description"];

interface IProperty {
  prop: {
    title: string;
    forms: Array<{
      href: string;
      contentType?: string;
      op?: string | string[];
      [key: string]: any;
    }>;
    description?: string;
    [key: string]: any;
  };
  propName: string;
}
const Property: React.FC<IProperty> = (props) => {
  const context = useContext(ediTDorContext);

  const [isExpanded, setIsExpanded] = useState(false);

  const addFormDialog = useRef<{ openModal: () => void }>(null);
  const handleOpenAddFormDialog = () => {
    addFormDialog.current?.openModal();
  };

  if (
    Object.keys(props.prop).length === 0 &&
    props.prop.constructor !== Object
  ) {
    return (
      <div className="text-3xl text-white">
        Property could not be rendered because mandatory fields are missing.
      </div>
    );
  }

  const property = props.prop;

  let forms: {
    href: string;
    op: string;
    contentType: string;
    actualIndex: number;
    [key: string]: any;
  }[] = separateForms(structuredClone(props.prop.forms));

  const attributeListObject = buildAttributeListObject(
    { name: props.propName },
    props.prop,
    alreadyRenderedKeys
  );
  const attributes = Object.keys(attributeListObject).map((x) => {
    return (
      <li key={x}>
        {x} : {JSON.stringify(attributeListObject[x])}
      </li>
    );
  });

  const handleDeletePropertyClicked = () => {
    context.removeOneOfAKindReducer("properties", props.propName);
  };

  return (
    <details
      className="mb-1"
      open={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      <summary
        className={`flex cursor-pointer items-center rounded-t-lg pl-2 text-xl font-bold text-white ${isExpanded ? "bg-gray-500" : ""}`}
      >
        <h3 className="flex-grow px-2">{property.title ?? props.propName}</h3>
        {isExpanded && (
          <button
            className="flex h-10 w-10 items-center justify-center self-stretch rounded-bl-md rounded-tr-md bg-gray-400 text-base"
            onClick={handleDeletePropertyClicked}
          >
            <Trash2 size={16} color="white" />
          </button>
        )}
      </summary>

      <div className="mb-4 rounded-b-lg bg-gray-500 px-2 pb-4">
        {property.description && (
          <div className="px-2 pb-2 text-lg text-gray-400">
            {property.description}
          </div>
        )}
        <ul className="list-disc pl-6 text-base text-gray-300">{attributes}</ul>

        <div className="flex items-center justify-start pb-2 pt-2">
          <InfoIconWrapper tooltip={getFormsTooltipContent()} id="properties">
            <h4 className="pr-1 text-lg font-bold text-white">Forms</h4>
          </InfoIconWrapper>
        </div>

        <AddFormElement onClick={handleOpenAddFormDialog} />
        <AddFormDialog
          type={"property"}
          interaction={property}
          interactionName={props.propName}
          ref={addFormDialog}
        />

        {forms.map((form, i) => (
          <Form
            key={`${i}-${form.href}`}
            propName={props.propName}
            form={form}
            interactionType={"property"}
          />
        ))}
      </div>
    </details>
  );
};

export default Property;
