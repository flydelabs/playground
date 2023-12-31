import { VisualNode } from "@flyde/core";

export const defaultNode: VisualNode = {
  instances: [
    {
      pos: {
        x: -257.0244506835937,
        y: -349.37652587890625,
      },
      id: "Inline-value-Hello-3r046zk",
      inputConfig: {},
      node: {
        id: "Inline-value-Hello,",
        inputs: {},
        outputs: {
          value: {
            delayed: false,
          },
        },
        runFnRawCode:
          "const result = ('Hello,'); Promise.resolve(result).then(val => outputs.value.next(val))",
        customViewCode: "'Hello,'",
        dataBuilderSource: "J0hlbGxvLCc=",
        templateType: "value",
        completionOutputs: ["value"],
        defaultStyle: {
          size: "regular",
          icon: "code",
          cssOverride: {
            fontFamily: "monospace",
            fontWeight: "500",
          },
        },
        description: "Custom inline value",
      },
      style: {
        size: "large",
        icon: "code",
        cssOverride: {
          fontFamily: "monospace",
          fontWeight: "500",
        },
      },
    },
    {
      pos: {
        x: -62.686528320312505,
        y: -244.63742309570313,
      },
      id: "Inline-value-World-vo146xh",
      inputConfig: {},
      node: {
        id: "Inline-value- World!",
        inputs: {},
        outputs: {
          value: {
            delayed: false,
          },
        },
        runFnRawCode:
          "const result = (' World!'); Promise.resolve(result).then(val => outputs.value.next(val))",
        customViewCode: "' World!'",
        dataBuilderSource: "JyBXb3JsZCEn",
        templateType: "value",
        completionOutputs: ["value"],
        defaultStyle: {
          size: "regular",
          icon: "code",
          cssOverride: {
            fontFamily: "monospace",
            fontWeight: "500",
          },
        },
        description: "Custom inline value",
      },
      style: {
        size: "large",
        icon: "code",
        cssOverride: {
          fontFamily: "monospace",
          fontWeight: "500",
        },
      },
    },
    {
      pos: {
        x: -43.04081217447907,
        y: 65.3379041689916,
      },
      id: "clftmb8cw000b4668nw8u5qr9",
      inputConfig: {},
      nodeId: "Concat",
    },
    {
      pos: {
        x: 11.271931966145928,
        y: -93.22169666108653,
      },
      id: "clftmbihe000j4668newg9ius",
      inputConfig: {
        delay: {
          mode: "static",
          value: 3500,
        },
      },
      nodeId: "Delay",
      style: {
        size: "small",
        icon: "fa-clock",
      },
    },
  ],
  connections: [
    {
      from: {
        insId: "Inline-value-Hello-3r046zk",
        pinId: "value",
      },
      to: {
        insId: "clftmb8cw000b4668nw8u5qr9",
        pinId: "a",
      },
    },
    {
      from: {
        insId: "Inline-value-World-vo146xh",
        pinId: "value",
      },
      to: {
        insId: "clftmbihe000j4668newg9ius",
        pinId: "value",
      },
    },
    {
      from: {
        insId: "clftmbihe000j4668newg9ius",
        pinId: "delayedValue",
      },
      to: {
        insId: "clftmb8cw000b4668nw8u5qr9",
        pinId: "b",
      },
    },
    {
      from: {
        insId: "clftmb8cw000b4668nw8u5qr9",
        pinId: "value",
      },
      to: {
        insId: "__this",
        pinId: "result",
      },
    },
  ],
  id: "HelloWorld",
  inputs: {},
  outputs: {
    result: {
      delayed: false,
    },
  },
  inputsPosition: {},
  outputsPosition: {
    result: {
      x: -23.264428942324532,
      y: 237.25953921502617,
    },
  },
} as VisualNode;
