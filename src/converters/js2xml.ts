import { createHelper, Helper } from '../helpers';

export interface Js2Xml {
  js2xml(doc, input);
}

export function createXMLConverter(): Js2Xml {
  const helper = createHelper();

  function null2xml(helper: Helper, doc): Node {
    return helper.createNode(doc, 'nil');
  }

  function string2xml(helper: Helper, doc, input: string): Node {
    return helper.createNode(doc, 'string', input);
  }

  function number2xml(helper: Helper, doc, input): Node {
    let type  = 'int',
      value = parseInt(input),
      f     = parseFloat(input);
    if (value !== f) {
      type  = 'double';
      value = f;
    }
    return helper.createNode(doc, type, value.toString());
  }

  function boolean2xml(helper: Helper, doc, input: boolean): Node {
    return helper.createNode(doc, 'boolean', (input ? '1' : '0'));
  }

  function array2xml(helper: Helper, doc, input: Array<string|boolean|number>): Node {
    const elements = input.reduce((acc, e) => {
      acc.push(js2xml(helper, doc, e));
      return acc;
    }, []);
    return helper.createNode(doc, 'array',
        helper.createNode(doc, 'data', elements)
      );
  }

  function struct2xml(helper: Helper, doc, input: Object): Node {
    const elements = Object.keys(input).reduce((acc, e, i, a) => {
      acc.push(helper.createNode(doc, 'member',
        [
          helper.createNode(doc, 'name', e),
          js2xml(helper, doc, input[e])
        ]
        ));
      return acc;
    }, []);
    return helper.createNode(doc, 'struct', elements);
  }

  function date2xml(helper: Helper, doc, input: Date): Node {
    const str = [
      input.getFullYear(),
      (input.getMonth() + 1 < 10) ? '0' + (input.getMonth() + 1) : input.getMonth() + 1,
      (input.getDate() < 10) ? '0' + (input.getDate()) : input.getDate(),
      'T',
      (input.getHours() < 10) ? '0' + (input.getHours()) : input.getHours(), ':',
      (input.getMinutes() < 10) ? '0' + (input.getMinutes()) : input.getMinutes(), ':',
      (input.getSeconds() < 10) ? '0' + (input.getSeconds()) : input.getSeconds()
    ];

    return helper.createNode(doc, 'dateTime.iso8601', str.join(''));
  }

  function uint8array2xml(helper: Helper, doc, input: Uint8Array): Node {
    const base64 = btoa(String.fromCharCode.apply(null, input));
    return helper.createNode(doc, 'base64', base64);
  }

  function getMethod(input) {
    const type = Object.prototype.toString
        .call(input)
        .slice(8, -1)
        .toLowerCase();
    switch (type) {
      case 'string':      return string2xml;
      case 'number':      return number2xml;
      case 'boolean':     return boolean2xml;
      case 'array':       return array2xml;
      case 'object':      return struct2xml;
      case 'date':        return date2xml;
      case 'uint8array':  return uint8array2xml;
      default: return string2xml;
    }
  }

  function js2xml(helper: Helper, doc, input) {
    let method = getMethod(input);
    if (input === null) {
      method = null2xml;
    }
    return helper.createNode(doc, 'value', method(helper, doc, input));
  }

  return {
    js2xml(doc, input) {
      return js2xml(helper, doc, input);
    }
  };
}
