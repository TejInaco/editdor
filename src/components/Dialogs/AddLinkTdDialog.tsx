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
import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import * as fileTdService from "../../services/fileTdService";
import { checkIfLinkIsInItem } from "../../utils/tdOperations";
import DialogTemplate from "./DialogTemplate";
import BaseButton from "../../components/TDViewer/base/BaseButton";

export interface AddLinkTdDialogRef {
  openModal: () => void;
  close: () => void;
}

interface Link {
  href: string;
  rel?: string;
  type?: string;
}

interface AddLinkTdDialogProps {
  interaction?: { links?: Link[] };
}

const AddLinkTdDialog = forwardRef<
  AddLinkTdDialogRef,
  AddLinkTdDialogProps
>((props, ref) => {
  const context = useContext(ediTDorContext);

  const [display, setDisplay] = React.useState<boolean>(false);
  const [linkingMethod, setLinkingMethod] = React.useState<string>("url");
  const [currentLinkedTd, setCurrentLinkedTd] = React.useState<
    Record<string, any>
  >({});

  const interaction = props.interaction ?? {};
  const tdJSON = context.parsedTD;

  useImperativeHandle(ref, () => ({
    openModal: () => setDisplay(true),
    close: () => setDisplay(false),
  }));

  const close = () => setDisplay(false);

  const checkIfLinkExists = (link: Link): boolean => {
    if (!interaction.links) return false;
    return checkIfLinkIsInItem(link, interaction);
  };

  const linkingMethodChange = (method: string): void => {
    setLinkingMethod(method);
    if (method === "url") {
      setCurrentLinkedTd({});
    }
  };

  const openFile = useCallback(async () => {
    try {
      const res = await fileTdService.readFromFile();

      (
        document.getElementById("link-href") as HTMLInputElement
      ).value = `./${res.fileName}`;

      setCurrentLinkedTd(
        res.fileHandle ? res.fileHandle : JSON.parse(res.td)
      );
    } catch (error) {
      console.error("Error opening TD file:", error);
      alert("We ran into an error trying to open your TD.");
    }
  }, []);

  const handleAddLink = () => {
    if (!context.isValidJSON) {
      showHrefErrorMessage("Can't add link. TD is malformed.");
      return;
    }

    const hrefInput = (
      document.getElementById("link-href") as HTMLInputElement
    ).value.trim();

    if (!hrefInput) {
      showHrefErrorMessage("The href field is mandatory.");
      return;
    }

    const link: Link = { href: hrefInput };

    const rel = (
      document.getElementById("rel") as HTMLInputElement
    ).value.trim();

    const type = (
      document.getElementById("type") as HTMLInputElement
    ).value.trim();

    if (rel) link.rel = rel;
    if (type) link.type = type;

    if (checkIfLinkExists(link)) {
      showHrefErrorMessage(
        "A link with the same target already exists."
      );
      return;
    }

    const updatedTd = structuredClone(context.parsedTD);

    if (!Array.isArray(updatedTd.links)) {
      updatedTd.links = [];
    }

    updatedTd.links.push(link);

    context.updateOfflineTD(JSON.stringify(updatedTd, null, 2));

    setCurrentLinkedTd({});
    close();
  };

  const RelationType = (): JSX.Element[] => {
    const relations = [
      "icon",
      "service-doc",
      "alternate",
      "type",
      "tm:extends",
      "proxy-to",
      "collection",
      "item",
      "predecessor-version",
      "controlledBy",
    ];

    return relations.map((rel, index) => (
      <option value={rel} key={index} />
    ));
  };

  const children = (
    <>
      <label className="pl-3 text-sm font-medium text-gray-400">
        Thing Description:
      </label>
      <div className="p-1">{tdJSON?.title}</div>

      <div className="p-1 pt-2">
        <label
          htmlFor="rel"
          className="pl-2 text-sm font-medium text-gray-400"
        >
          Relation
        </label>

        <input
          list="relationType"
          type="text"
          id="rel"
          className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white"
          placeholder="relation name"
        />

        <datalist id="relationType">
          <RelationType />
        </datalist>

        <span
          id="link-rel-info"
          className="pl-2 text-xs text-red-400"
        ></span>
      </div>

      <div className="p-1 pt-2">
        <label
          htmlFor="link-href"
          className="pl-2 text-sm font-medium text-gray-400"
        >
          Target resource
        </label>

        <BaseButton
          type="button"
          disabled={linkingMethod === "upload"}
          onClick={() => linkingMethodChange("upload")}
          variant="primary"
        >
          From local machine
        </BaseButton>

        <BaseButton
          type="button"
          disabled={linkingMethod === "url"}
          onClick={() => linkingMethodChange("url")}
          className="ml-2"
          variant="primary"
        >
          Resource URL
        </BaseButton>

        <div className="pt-4">
          <input
            type="text"
            id="link-href"
            className="rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white"
            placeholder="Target resource"
            disabled={linkingMethod !== "url"}
            onChange={clearHrefErrorMessage}
          />

          {linkingMethod === "upload" && (
            <BaseButton
              type="button"
              onClick={openFile}
              variant="primary"
              className="ml-2"
            >
              Open TD
            </BaseButton>
          )}
        </div>

        <span
          id="link-href-info"
          className="pl-2 text-xs text-red-400"
        ></span>

        <div className="pt-2">
          <label
            htmlFor="type"
            className="pl-2 text-sm font-medium text-gray-400"
          >
            Type
          </label>

          <input
            list="mediaType"
            type="text"
            id="type"
            className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white"
            placeholder="media type"
          />

          <datalist id="mediaType">
            <option value="application/td+json" />
            <option value="image/jpeg" />
            <option value="text/csv" />
            <option value="video/mp4" />
          </datalist>
        </div>
      </div>
    </>
  );

  if (!display) return null;

  return ReactDOM.createPortal(
    <DialogTemplate
      onHandleEventLeftButton={close}
      onHandleEventRightButton={handleAddLink}
      rightButton="Add"
      title="Add Link"
      description={`Tell us how this ${tdJSON?.title} can interact with other resources`}
    >
      {children}
    </DialogTemplate>,
    document.getElementById("modal-root") as HTMLElement
  );
});

AddLinkTdDialog.displayName = "AddLinkTdDialog";
export default AddLinkTdDialog;

const showHrefErrorMessage = (msg: string) => {
  const info = document.getElementById("link-href-info");
  const input = document.getElementById("link-href");

  if (info) info.textContent = msg;
  if (input) {
    input.classList.remove("border-gray-600");
    input.classList.add("border-red-400");
  }
};

const clearHrefErrorMessage = () => {
  const input = document.getElementById("link-href");

  if (input) {
    input.classList.add("border-gray-600");
    input.classList.remove("border-red-400");
  }
};
