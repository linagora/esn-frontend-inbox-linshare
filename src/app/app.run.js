angular.module('linagora.esn.unifiedinbox.linshare')
  .run(run)

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
