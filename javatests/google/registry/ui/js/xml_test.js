// Copyright 2017 The Nomulus Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.setTestOnly();

goog.require('goog.dom.xml');
goog.require('registry.testing');
goog.require('registry.xml');

describe("xml test", function() {
  it("testEmptyElement_hasNoKeyValue", function() {
    assertXmlTurnsIntoJson(
        {'epp': {}},
        '<epp></epp>');
  });

  it("testSelfClosingRootElement_hasNoKeyValue", function() {
    assertXmlTurnsIntoJson(
        {'epp': {}},
        '<epp/>');
  });

  it("testElementWithWhitespaceTextContent_getsIgnored", function() {
    assertXmlTurnsIntoJson(
        {'epp': {}},
        '<epp>  \r\n </epp>');
  });

  it("testElementWithTextContent_getsSetToKeyValueField", function() {
    assertXmlTurnsIntoJson(
        {'epp': {'keyValue': 'hello'}},
        '<epp>hello</epp>');
  });

  it("testTextWithSpacesOnSides_getsTrimmed", function() {
    assertXmlTurnsIntoJson(
        {'epp': {'keyValue': 'hello'}},
        '<epp> hello </epp>');
  });

  it("testAttribute_getsSetToFieldPrefixedByAtSymbol", function() {
    assertXmlTurnsIntoJson(
        {'epp': {'@ohmy': 'goth'}},
        '<epp ohmy="goth"/>');
  });

  it("testSingleNestedElement_keyIsNameAndValueIsNode", function() {
    assertXmlTurnsIntoJson(
        {'epp': {'ohmy': {'keyValue': 'goth'}}},
        '<epp><ohmy>goth</ohmy></epp>');
  });

  it("testMultipleNestedElements_valueBecomesArray", function() {
    assertXmlTurnsIntoJson(
        {'epp': {'ohmy': [{'keyValue': 'goth1'}, {'keyValue': 'goth2'}]}},
        '<epp><ohmy>goth1</ohmy><ohmy>goth2</ohmy></epp>');
  });

  it("testInterspersedText_throwsError", function() {
    expect(function() {
      registry.xml.convertToJson(
          goog.dom.xml.loadXml(
              '<epp> hello <omg/> there </epp>'));
    }).toThrowError('XML text "hello" interspersed with "there"');
  });

  it("testEppMessage", function() {
    assertXmlTurnsIntoJson(
        {
          'epp': {
            '@xmlns': 'urn:ietf:params:xml:ns:epp-1.0',
            'response': {
              'result': {
                '@code': '1000',
                'msg': {'keyValue': 'Command completed successfully'}
              },
              'resData': {
                'domain:infData': {
                  '@xmlns:domain': 'urn:ietf:params:xml:ns:domain-1.0',
                  'domain:name': {'keyValue': 'justine.lol'},
                  'domain:roid': {'keyValue': '6-roid'},
                  'domain:status': {'@s': 'inactive'},
                  'domain:registrant': {'keyValue': 'GK Chesterton'},
                  'domain:contact': [
                    {'@type': 'admin', 'keyValue': '<justine>'},
                    {'@type': 'billing', 'keyValue': 'candycrush'},
                    {'@type': 'tech', 'keyValue': 'krieger'}
                  ],
                  'domain:ns': {
                    'domain:hostObj': [
                      {'keyValue': 'ns1.justine.lol'},
                      {'keyValue': 'ns2.justine.lol'}
                    ]
                  },
                  'domain:host': {'keyValue': 'ns1.justine.lol'},
                  'domain:clID': {'keyValue': 'justine'},
                  'domain:crID': {'keyValue': 'justine'},
                  'domain:crDate': {'keyValue': '2014-07-10T02:17:02Z'},
                  'domain:exDate': {'keyValue': '2015-07-10T02:17:02Z'},
                  'domain:authInfo': {
                    'domain:pw': {'keyValue': 'lolcat'}
                  }
                }
              },
              'trID': {
                'clTRID': {'keyValue': 'abc-1234'},
                'svTRID': {'keyValue': 'ytk1RO+8SmaDQxrTIdulnw==-4'}
              }
            }
          }
        },
        '<?xml version="1.0"?>' +
            '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
            '  <response>' +
            '    <result code="1000">' +
            '      <msg>Command completed successfully</msg>' +
            '    </result>' +
            '    <resData>' +
            '      <domain:infData' +
            '          xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
            '        <domain:name>justine.lol</domain:name>' +
            '        <domain:roid>6-roid</domain:roid>' +
            '        <domain:status s="inactive"/>' +
            '        <domain:registrant>GK Chesterton</domain:registrant>' +
            '     <domain:contact type="admin">&lt;justine&gt;</domain:contact>' +
            '        <domain:contact type="billing">candycrush</domain:contact>' +
            '        <domain:contact type="tech">krieger</domain:contact>' +
            '        <domain:ns>' +
            '          <domain:hostObj>ns1.justine.lol</domain:hostObj>' +
            '          <domain:hostObj>ns2.justine.lol</domain:hostObj>' +
            '        </domain:ns>' +
            '        <domain:host>ns1.justine.lol</domain:host>' +
            '        <domain:clID>justine</domain:clID>' +
            '        <domain:crID>justine</domain:crID>' +
            '        <domain:crDate>2014-07-10T02:17:02Z</domain:crDate>' +
            '        <domain:exDate>2015-07-10T02:17:02Z</domain:exDate>' +
            '        <domain:authInfo>' +
            '          <domain:pw>lolcat</domain:pw>' +
            '        </domain:authInfo>' +
            '      </domain:infData>' +
            '    </resData>' +
            '    <trID>' +
            '      <clTRID>abc-1234</clTRID>' +
            '      <svTRID>ytk1RO+8SmaDQxrTIdulnw==-4</svTRID>' +
            '    </trID>' +
            '  </response>' +
            '</epp>');
  });

  /**
   * Asserts `xml` turns into `json`.
   * @param {!Object} json
   * @param {string} xml
   */
  function assertXmlTurnsIntoJson(json, xml) {
    registry.testing.assertObjectEqualsPretty(
        json, registry.xml.convertToJson(goog.dom.xml.loadXml(xml)));
  }
});
