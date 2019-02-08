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

goog.require('goog.History');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.net.XhrIo');
goog.require('registry.registrar.Console');
goog.require('registry.registrar.ConsoleTestUtil');
goog.require('registry.testing');

describe("domain test", function() {
  const $ = goog.dom.getRequiredElement;
  const _ = goog.testing.mockmatchers.ignoreArgument;
  const stubs = new goog.testing.PropertyReplacer();
  const mocks = new goog.testing.MockControl();

  let historyMock;
  let registrarConsole;

  beforeEach(function() {
    registry.testing.addToDocument('<div id="test"/>');
    registry.testing.addToDocument('<div class="kd-butterbar"/>');
    registry.registrar.ConsoleTestUtil.renderConsoleMain($('test'), {});
    stubs.setPath('goog.net.XhrIo', goog.testing.net.XhrIo);

    historyMock = mocks.createStrictMock(goog.History);
    mocks.createConstructorMock(goog, 'History')().$returns(historyMock);
    historyMock.addEventListener(_, _, _);
    historyMock.setEnabled(true);

    mocks.$replayAll();
    registrarConsole = new registry.registrar.Console({
      xsrfToken: '☢',
      clientId: 'jartine'
    });
    mocks.$verifyAll();
  });

  afterEach(function() {
    goog.dispose(registrarConsole);
    stubs.reset();
    mocks.$tearDown();
    goog.testing.net.XhrIo.cleanup();
  });

  /** Handles EPP login. */
  function handleLogin() {
    const request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <login>' +
        '      <clID>jartine</clID>' +
        '      <pw>undefined</pw>' +
        '      <options>' +
        '        <version>1.0</version>' +
        '        <lang>en</lang>' +
        '      </options>' +
        '      <svcs>' +
        '        <objURI>urn:ietf:params:xml:ns:host-1.0</objURI>' +
        '        <objURI>urn:ietf:params:xml:ns:domain-1.0</objURI>' +
        '        <objURI>urn:ietf:params:xml:ns:contact-1.0</objURI>' +
        '      </svcs>' +
        '    </login>' +
        '    <clTRID>asdf-1235</clTRID>' +
        '  </command>' +
        '</epp>');
    const response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="2002">' +
        '      <msg>Registrar is already logged in</msg>' +
        '    </result>' +
        '    <trID>' +
        '      <clTRID>asdf-1235</clTRID>' +
        '      <svTRID>ytk1RO+8SmaDQxrTIdulnw==-3</svTRID>' +
        '    </trID>' +
        '  </response>' +
        '</epp>');
    const xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);
  }

  it("testView", function() {
    runTestView();
  });

  function runTestView() {
    historyMock.$reset();
    historyMock.getToken().$returns('domain/justine.lol').$anyTimes();

    mocks.$replayAll();

    registrarConsole.handleHashChange();
    handleLogin();

    const request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <info>' +
        '      <domain:info xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name hosts="all">justine.lol</domain:name>' +
        '      </domain:info>' +
        '    </info>' +
        '    <clTRID>abc-1234</clTRID>' +
        '  </command>' +
        '</epp>');
    const response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="1000">' +
        '      <msg>Command completed successfully</msg>' +
        '    </result>' +
        '    <resData>' +
        '     <domain:infData xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>justine.lol</domain:name>' +
        '        <domain:roid>6-roid</domain:roid>' +
        '        <domain:status s="inactive"/>' +
        '        <domain:registrant>GK Chesterton</domain:registrant>' +
        '        <domain:contact type="admin">&lt;justine&gt;</domain:contact>' +
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
    const xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);
    expect(0).toEqual(goog.testing.net.XhrIo.getSendInstances().length);

    mocks.$verifyAll();

    expect($('domain:exDate').readOnly).toBe(true);
    expect($('reg-content').innerHTML).toContain('justine.lol');
    expect('2015-07-10T02:17:02Z').toEqual($('domain:exDate').value);
    expect('GK Chesterton').toEqual($('domain:registrant').value);
    expect('<justine>').toEqual($('domain:contact[0].value').value);
    expect('candycrush').toEqual($('domain:contact[1].value').value);
    expect('krieger').toEqual($('domain:contact[2].value').value);
    expect('lolcat').toEqual($('domain:authInfo.domain:pw').value);
    expect('ns1.justine.lol').toEqual($('domain:ns.domain:hostObj[0].value').value);
    expect('ns2.justine.lol').toEqual($('domain:ns.domain:hostObj[1].value').value);
  }

  it("testEdit", function() {
    runTestView();
    historyMock.$reset();

    mocks.$replayAll();

    registry.testing.click($('reg-app-btn-edit'));
    assertFalse('Form should be edible.', $('domain:exDate').readOnly);
    $('domain:registrant').value = 'Jonathan Swift';
    $('domain:authInfo.domain:pw').value = '(✿◕‿◕)ノ';

    registry.testing.click($('reg-app-btn-save'));

    let request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <update>' +
        '      <domain:update xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>justine.lol</domain:name>' +
        '        <domain:chg>' +
        '          <domain:registrant>Jonathan Swift</domain:registrant>' +
        '          <domain:authInfo>' +
        '            <domain:pw>(✿◕‿◕)ノ</domain:pw>' +
        '          </domain:authInfo>' +
        '        </domain:chg>' +
        '      </domain:update>' +
        '    </update>' +
        '    <clTRID>abc-1234</clTRID>' +
        '  </command>' +
        '</epp>');
    let response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="1000">' +
        '      <msg>This world is built from a million lies.</msg>' +
        '    </result>' +
        '    <trID>' +
        '      <clTRID>abc-1234</clTRID>' +
        '      <svTRID>214CjbYuTsijoP8sgyFUNg==-e</svTRID>' +
        '    </trID>' +
        '  </response>' +
        '</epp>');
    let xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);

    request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <info>' +
        '      <domain:info xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name hosts="all">justine.lol</domain:name>' +
        '      </domain:info>' +
        '    </info>' +
        '    <clTRID>abc-1234</clTRID>' +
        '  </command>' +
        '</epp>');
    response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="1000">' +
        '      <msg>How can we live in the land of the dead?</msg>' +
        '    </result>' +
        '    <resData>' +
        '     <domain:infData xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>justine.lol</domain:name>' +
        '        <domain:roid>6-roid</domain:roid>' +
        '        <domain:status s="inactive"/>' +
        '        <domain:registrant>Jonathan Swift</domain:registrant>' +
        '        <domain:contact type="admin">&lt;justine&gt;</domain:contact>' +
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
        '          <domain:pw>(✿◕‿◕)ノ</domain:pw>' +
        '        </domain:authInfo>' +
        '      </domain:infData>' +
        '    </resData>' +
        '    <trID>' +
        '      <clTRID>abc-1234</clTRID>' +
        '      <svTRID>ytk1RO+8SmaDQxrTIdulnw==-4</svTRID>' +
        '    </trID>' +
        '  </response>' +
        '</epp>');
    xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);
    expect(0).toEqual(goog.testing.net.XhrIo.getSendInstances().length);

    mocks.$verifyAll();

    expect($('domain:exDate').readOnly).toBe(true);
    expect($('reg-content').innerHTML).toContain('justine.lol');
    expect('2015-07-10T02:17:02Z').toEqual($('domain:exDate').value);
    expect('Jonathan Swift').toEqual($('domain:registrant').value);
    expect('<justine>').toEqual($('domain:contact[0].value').value);
    expect('candycrush').toEqual($('domain:contact[1].value').value);
    expect('krieger').toEqual($('domain:contact[2].value').value);
    expect('(✿◕‿◕)ノ').toEqual($('domain:authInfo.domain:pw').value);
    expect('ns1.justine.lol').toEqual($('domain:ns.domain:hostObj[0].value').value);
    expect('ns2.justine.lol').toEqual($('domain:ns.domain:hostObj[1].value').value);
  });

  it("testEdit_cancel_restoresOriginalValues", function() {
    runTestView();

    registry.testing.click($('reg-app-btn-edit'));
    assertFalse('Form should be edible.', $('domain:exDate').readOnly);
    $('domain:registrant').value = 'Jonathan Swift';
    $('domain:authInfo.domain:pw').value = '(✿◕‿◕)ノ';

    registry.testing.click($('reg-app-btn-cancel'));
    assertTrue('Form should be read-only.', $('domain:exDate').readOnly);
    assertEquals('GK Chesterton', $('domain:registrant').value);
    assertEquals('lolcat', $('domain:authInfo.domain:pw').value);
  });

  it("testCreate", function() {
    historyMock.$reset();
    historyMock.getToken().$returns('domain').$anyTimes();
    mocks.$replayAll();
    registrarConsole.handleHashChange();
    handleLogin();
    mocks.$verifyAll();

    assertFalse('Form should be edible.', $('domain:name').readOnly);
    $('domain:name').value = 'bog.lol';
    $('domain:period').value = '1';
    $('domain:authInfo.domain:pw').value = 'attorney at lawl';
    $('domain:registrant').value = 'Chris Pohl';
    registry.testing.click($('domain-contact-add-button'));
    $('domain:contact[0].value').value = 'BlutEngel';
    $('domain:contact[0].@type').value = 'admin';
    registry.testing.click($('domain-contact-add-button'));
    $('domain:contact[1].value').value = 'Ravenous';
    $('domain:contact[1].@type').value = 'tech';
    registry.testing.click($('domain-contact-add-button'));
    $('domain:contact[2].value').value = 'Dark Angels';
    $('domain:contact[2].@type').value = 'billing';

    historyMock.$reset();
    mocks.$replayAll();

    registry.testing.click($('reg-app-btn-save'));

    let request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <create>' +
        '      <domain:create xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>bog.lol</domain:name>' +
        '        <domain:period unit="y">1</domain:period>' +
        '        <domain:registrant>Chris Pohl</domain:registrant>' +
        '        <domain:contact type="admin">BlutEngel</domain:contact>' +
        '        <domain:contact type="tech">Ravenous</domain:contact>' +
        '        <domain:contact type="billing">Dark Angels</domain:contact>' +
        '        <domain:authInfo>' +
        '          <domain:pw>attorney at lawl</domain:pw>' +
        '        </domain:authInfo>' +
        '      </domain:create>' +
        '    </create>' +
        '    <clTRID>abc-1234</clTRID>' +
        '  </command>' +
        '</epp>');
    let response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="1000">' +
        '      <msg>Command completed successfully</msg>' +
        '    </result>' +
        '    <resData>' +
        '     <domain:creData xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>bog.lol</domain:name>' +
        '        <domain:crDate>2014-07-17T08:19:24Z</domain:crDate>' +
        '        <domain:exDate>2015-07-17T08:19:24Z</domain:exDate>' +
        '      </domain:creData>' +
        '    </resData>' +
        '    <trID>' +
        '      <clTRID>abc-1234</clTRID>' +
        '      <svTRID>OBPI6JvEQfOUaO8qGf+IKA==-7</svTRID>' +
        '    </trID>' +
        '  </response>' +
        '</epp>');
    let xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);

    request = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <command>' +
        '    <info>' +
        '      <domain:info xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name hosts="all">bog.lol</domain:name>' +
        '      </domain:info>' +
        '    </info>' +
        '    <clTRID>abc-1234</clTRID>' +
        '  </command>' +
        '</epp>');
    response = registry.testing.loadXml(
        '<?xml version="1.0"?>' +
        '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' +
        '  <response>' +
        '    <result code="1000">' +
        '      <msg>Command completed successfully</msg>' +
        '    </result>' +
        '    <resData>' +
        '     <domain:infData xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' +
        '        <domain:name>bog.lol</domain:name>' +
        '        <domain:roid>1f-roid</domain:roid>' +
        '        <domain:status s="inactive"/>' +
        '        <domain:registrant>Chris Pohl</domain:registrant>' +
        '        <domain:contact type="admin">BlutEngel</domain:contact>' +
        '        <domain:contact type="tech">Ravenous</domain:contact>' +
        '        <domain:contact type="billing">Dark Angels</domain:contact>' +
        '        <domain:clID>justine</domain:clID>' +
        '        <domain:crID>justine</domain:crID>' +
        '        <domain:crDate>2014-07-17T08:19:24Z</domain:crDate>' +
        '        <domain:exDate>2015-07-17T08:19:24Z</domain:exDate>' +
        '        <domain:authInfo>' +
        '          <domain:pw>attorney at lawl</domain:pw>' +
        '        </domain:authInfo>' +
        '      </domain:infData>' +
        '    </resData>' +
        '    <extension>' +
        '      <rgp:infData xmlns:rgp="urn:ietf:params:xml:ns:rgp-1.0">' +
        '        <rgp:rgpStatus s="addPeriod"/>' +
        '      </rgp:infData>' +
        '    </extension>' +
        '    <trID>' +
        '      <clTRID>abc-1234</clTRID>' +
        '      <svTRID>OBPI6JvEQfOUaO8qGf+IKA==-8</svTRID>' +
        '    </trID>' +
        '  </response>' +
        '</epp>');
    xhr = goog.testing.net.XhrIo.getSendInstances().pop();
    expect(xhr.isActive()).toBe(true);
    expect('/registrar-xhr?clientId=jartine').toEqual(xhr.getLastUri());
    expect('☢').toEqual(xhr.getLastRequestHeaders()['X-CSRF-Token']);
    registry.testing.assertXmlEquals(request, xhr.getLastContent());
    xhr.simulateResponse(200, response);
    expect(0).toEqual(goog.testing.net.XhrIo.getSendInstances().length);

    mocks.$verifyAll();

    expect($('domain:exDate').readOnly).toBe(true);
    expect($('reg-content').innerHTML).toContain('bog.lol');
    expect('2015-07-17T08:19:24Z').toEqual($('domain:exDate').value);
    expect('Chris Pohl').toEqual($('domain:registrant').value);
    expect('BlutEngel').toEqual($('domain:contact[0].value').value);
    expect('Ravenous').toEqual($('domain:contact[1].value').value);
    expect('Dark Angels').toEqual($('domain:contact[2].value').value);
    expect('attorney at lawl').toEqual($('domain:authInfo.domain:pw').value);
    expect(goog.dom.getElement('domain:ns.domain:hostObj[0].value')).toBeNull();
  });
});
