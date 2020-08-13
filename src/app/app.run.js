angular.module('linagora.esn.unifiedinbox.linshare')
  .run(run)
  .run(injectAttachmentSaveAction);

function run(
  inboxAttachmentProviderRegistry,
  inboxLinshareAttachmentProvider,
  inboxLinsharePresendingHook,
  inboxLinsharePrecomposingHook,
  inboxEmailSendingHookService,
  inboxEmailComposingHookService,
  dynamicDirectiveService,
  linshareConfigurationService
) {
  linshareConfigurationService.isConfigured().then(function(isConfigured) {
    if (!isConfigured) {
      return;
    }

    let ddDesktop = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
      attributes: [{ name: 'email', value: '$ctrl.message' }]
    });

    let ddMobile = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
      attributes: [{ name: 'email', value: '$ctrl.message' }, { name: 'is-mobile', value: 'true' }]
    });

    dynamicDirectiveService.addInjection('inboxComposerExtraButtons', ddDesktop);
    dynamicDirectiveService.addInjection('inboxMobileComposerExtraButtons', ddMobile);
    inboxAttachmentProviderRegistry.add(inboxLinshareAttachmentProvider);
    inboxEmailSendingHookService.registerPreSendingHook(inboxLinsharePresendingHook);
    inboxEmailComposingHookService.registerPreComposingHook(inboxLinsharePrecomposingHook);
  });
}

function injectAttachmentSaveAction(dynamicDirectiveService) {
  let saveAction = new dynamicDirectiveService.DynamicDirective(true, 'inbox-linshare-attachment-save-action', {
    attributes: [{ name: 'attachment', value: 'attachment' }],
    priority: -10
  });

  dynamicDirectiveService.addInjection('attachments-action-list', saveAction);
}
