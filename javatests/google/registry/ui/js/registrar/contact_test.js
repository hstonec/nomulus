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

goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.testing.MockControl');
goog.require('registry.registrar.ConsoleTestUtil');
goog.require('registry.testing');

describe("contact test", function() {
  const $ = goog.dom.getRequiredElement;

  const test = {
    mockControl: new goog.testing.MockControl()
  };

  beforeEach(function() {
    registry.testing.addToDocument('<div id="test"/>');
    registry.testing.addToDocument('<div class="kd-butterbar"/>');
    registry.registrar.ConsoleTestUtil.renderConsoleMain($('test'), {});
    registry.registrar.ConsoleTestUtil.setup(test);
  });

  afterEach(function() {
    goog.dispose(test.console);
    test.mockControl.$tearDown();
  });

  /** Contact hash path should nav to contact page. */
  it("testVisitContact", function() {
    testVisitContact();
    expect(2).toEqual($('contact-postalInfo').childNodes.length);
  });

  /** Contact hash path should nav to contact page. */
  it("testEdit", function() {
    testEdit();
  });

  /** Contact hash path should nav to contact page. */
  it("testAddPostalInfo", function() {
    testEdit();
    const addPiBtn = $('domain-contact-postalInfo-add-button');
    expect(addPiBtn.getAttribute('disabled')).toBeNull();
    registry.testing.click(addPiBtn);
    expect(addPiBtn.hasAttribute('disabled')).toBe(true);
    expect(3).toEqual($('contact-postalInfo').childNodes.length);
  });

  function testEdit() {
    testVisitContact();
    registry.testing.assertVisible($('reg-app-btns-edit'));
    registry.testing.click($('reg-app-btn-edit'));
    registry.testing.assertHidden($('reg-app-btns-edit'));
    registry.testing.assertVisible($('reg-app-btns-save'));
  }

  function testVisitContact() {
    registry.registrar.ConsoleTestUtil.visit(test, {
      path: 'contact/pabloistrad',
      rspXml: '<?xml version="1.0"?>' +
          '<epp xmlns:domain="urn:ietf:params:xml:ns:domain-1.0"' +
          '     xmlns:contact="urn:ietf:params:xml:ns:contact-1.0"' +
          '     xmlns:host="urn:ietf:params:xml:ns:host-1.0"' +
          '     xmlns:launch="urn:ietf:params:xml:ns:launch-1.0"' +
          '     xmlns:rgp="urn:ietf:params:xml:ns:rgp-1.0"' +
          '     xmlns="urn:ietf:params:xml:ns:epp-1.0"' +
          '     xmlns:secDNS="urn:ietf:params:xml:ns:secDNS-1.1"' +
          '     xmlns:mark="urn:ietf:params:xml:ns:mark-1.0">' +
          '  <response>' +
          '    <result code="1000">' +
          '      <msg>Command completed successfully</msg>' +
          '    </result>' +
          '    <resData>' +
          '      <contact:infData>' +
          '        <contact:id>pabloistrad</contact:id>' +
          '        <contact:roid>1-roid</contact:roid>' +
          '        <contact:status s="ok"/>' +
          '        <contact:postalInfo type="int">' +
          '          <contact:name>name2</contact:name>' +
          '          <contact:addr>' +
          '            <contact:street></contact:street>' +
          '            <contact:city>city2</contact:city>' +
          '            <contact:cc>US</contact:cc>' +
          '          </contact:addr>' +
          '        </contact:postalInfo>' +
          '        <contact:voice/>' +
          '        <contact:fax/>' +
          '        <contact:email>test2.ui@example.com</contact:email>' +
          '        <contact:clID>daddy</contact:clID>' +
          '        <contact:crID>daddy</contact:crID>' +
          '        <contact:crDate>2014-05-06T22:16:36Z</contact:crDate>' +
          '        <contact:upID>daddy</contact:upID>' +
          '        <contact:upDate>2014-05-07T16:20:07Z</contact:upDate>' +
          '       <contact:authInfo>' +
          '          <contact:pw>asdfasdf</contact:pw>' +
          '        </contact:authInfo>' +
          '      </contact:infData>' +
          '    </resData>' +
          '    <trID>' +
          '      <clTRID>abc-1234</clTRID>' +
          '      <svTRID>c4O3B0pRRKKSrrXsJvxP5w==-2</svTRID>' +
          '    </trID>' +
          '  </response>' +
          '</epp>'
    });
   }
});