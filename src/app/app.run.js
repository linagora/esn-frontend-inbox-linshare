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
  linshareConfigurationService
) {
  linshareConfigurationService.isConfigured().then(function(isConfigured) {
    if (!isConfigured) {
      return;
    }

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
