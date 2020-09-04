'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('The inboxLinshareComposerSelectAttachment component', function() {
  let $modal, $rootScope, $compile;

  beforeEach(function() {
    $modal = sinon.spy();

    angular.mock.module('linagora.esn.unifiedinbox.linshare');
    angular.mock.module(function($provide) {
      $provide.value('$modal', $modal);
      $provide.value('maxPlusFilter', function(value) { return value; });
    });

    inject(function(_$compile_, _$rootScope_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
    });
  });

  function initComponent(template, scope) {
    scope = scope || $rootScope.$new();

    const element = $compile(template)(scope);

    scope.$digest();

    return element;
  }

  it('should open LinShare files browser when user click on LinShare button', function() {
    const scope = $rootScope.$new();
    const email = {
      attachments: [{
        attachmentType: 'linshare',
        name: 'attachment1.jpg',
        size: 416331,
        type: 'image/jpeg'
      }]
    };

    scope.email = email;

    const element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    element.find('button')[0].click();
    expect($modal).to.have.been.called;
  });

  it('should update number of linshare attachment and display it on LinShare button', function() {
    const scope = $rootScope.$new();
    const attachment1 = {
      attachmentType: 'linshare',
      name: 'attachment1.jpg',
      size: 416331,
      type: 'image/jpeg'
    };
    const attachment2 = {
      attachmentType: 'linshare',
      name: 'attachment2.jpg',
      size: 416331,
      type: 'image/jpeg'
    };

    scope.email = {
      attachments: [attachment1]
    };

    const element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.composer-badge').text()).to.equal('1');
    scope.email.attachments.push(attachment2);
    scope.$digest();

    expect(element.find('.composer-badge').text()).to.equal('2');
  });

  it('should not display number of LinShare attachment if there is no LinShare attachment', function() {
    const scope = $rootScope.$new();

    scope.email = {
      attachments: []
    };
    const element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.composer-badge').hasClass('ng-hide')).to.be.true;
  });

  it('should flash when an LinShare attachment is uploading', function() {
    const scope = $rootScope.$new();

    scope.email = {
      attachments: [
        {
          attachmentType: 'linshare',
          name: 'attachment.jpg',
          size: 416331,
          type: 'image/jpeg',
          status: 'uploading'
        }
      ]
    };
    const element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.linshare-uploading').length).to.equal(1);
    scope.email.attachments[0].status = 'uploaded';
    scope.$digest();
    expect(element.find('.linshare-uploading').length).to.equal(0);
  });

  it('should notify user when upload LinShare attachment unsuccessfully', function() {
    const scope = $rootScope.$new();

    scope.email = {
      attachments: [
        {
          attachmentType: 'linshare',
          name: 'attachment.jpg',
          size: 416331,
          type: 'image/jpeg',
          status: 'error'
        }
      ]
    };
    const element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.error').length).to.equal(1);
  });
});
