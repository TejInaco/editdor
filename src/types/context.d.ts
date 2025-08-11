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
import type { ThingDescription } from "wot-thing-description-types";

interface INorthboundConnection {
  readonly message: string;
  readonly northboundTd: ThingDescription | {};
}

interface IEdiTDorContext {
  // offlineTD: Saving or displaying the TD as JSON For storage, sharing, or exporting Primary source of truth for the TD
  offlineTD: string;
  isValidJSON: boolean;
  // ParsedTD: Accessing and modifying TD properties 	For programmatic manipulation JavaScript object Derived from offlineTD
  parsedTD: IThingDescription;
  isModified: boolean;
  name: string;
  fileHandle: string | null;
  linkedTd: Record<string, any>;
  validationMessage?: any;
  northboundConnection: INorthboundConnection;

  // Callback functions
  updateOfflineTD: (td: string) => void;
  updateIsModified: (isModified: boolean) => void;
  setFileHandle: (handle: string | null) => void;
  removeForm: (
    level: string,
    interactionName: string,
    toBeDeletedForm: { href: string; op: string },
    index: number
  ) => void;
  addForm: (level: string, interactionName: string, form: any) => void;
  removeLink: (link: any) => void;
  removeOneOfAKindReducer: (kind: string, oneOfAKind: string) => void;
  addLinkedTd: (linkedTd: Record<string, any>) => void;
  updateLinkedTd: (linkedTd: Record<string, any>) => void;
  updateValidationMessage: (validationMessage?: any) => void;
  updateNorthboundConnection: (
    northboundConnection: INorthboundConnection
  ) => void;
}

type EditorState = Omit<
  IEdiTDorContext,
  | "updateOfflineTD"
  | "updateIsModified"
  | "setFileHandle"
  | "removeForm"
  | "addForm"
  | "removeLink"
  | "removeOneOfAKindReducer"
  | "addLinkedTd"
  | "updateLinkedTd"
  | "updateValidationMessage"
>;

type Action =
  | { type: "UPDATE_OFFLINE_TD"; offlineTD: string }
  | { type: "UPDATE_IS_MODIFIED"; isModified: boolean }
  | { type: "SET_FILE_HANDLE"; fileHandle: any }
  | { type: "REMOVE_LINK_FROM_TD"; link: any }
  | {
      type: "ADD_FORM_TO_TD";
      level: "thing" | "properties" | "actions" | "events" | string;
      interactionName: string;
      form: any;
    }
  | {
      type: "REMOVE_FORM_FROM_TD";
      level: "thing" | "properties" | "actions" | "events" | string;
      interactionName: string;
      toBeDeletedForm: any;
      index: number;
    }
  | {
      type: "REMOVE_ONE_OF_A_KIND_FROM_TD";
      kind: "thing" | "properties" | "actions" | "events" | string;
      oneOfAKindName: string;
    }
  | { type: "ADD_LINKED_TD"; linkedTd: any }
  | { type: "UPDATE_LINKED_TD"; linkedTd: any }
  | { type: "UPDATE_VALIDATION_MESSAGE"; validationMessage: any }
  | {
      type: "UPDATE_NORTHBOUND_CONNECTION";
      northboundConnection: INorthboundConnection;
    };
