/**
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2015 ForgeRock AS.
 */

define("org/forgerock/openam/ui/admin/views/realms/authentication/AddChainDialog", [
    "jquery",
    "lodash",
    "org/forgerock/commons/ui/common/components/BootstrapDialog",
    "handlebars",
    "org/forgerock/commons/ui/common/components/Messages",
    "org/forgerock/commons/ui/common/main/Router",
    "org/forgerock/openam/ui/admin/delegates/SMSRealmDelegate",
    "org/forgerock/commons/ui/common/util/UIUtils"
], function ($, _, BootstrapDialog, Handlebars, Messages, Router, SMSRealmDelegate, UIUtils) {
    function closeDialog (dialog) {
        dialog.close();
    }
    function nameValid (chains, name) {
        return _.every(chains, function (chain) {
            return chain._id !== name;
        });
    }
    function validateAndCreate (dialog) {
        var name = dialog.getModalBody().find("#name").val().trim();

        if (nameValid(dialog.options.data.chains, name)) {
            SMSRealmDelegate.authentication.chains.create(
                dialog.options.data.realmPath,
                { _id: name }
            ).then(function () {
                dialog.close();
                Router.routeTo(Router.configuration.routes.realmsAuthenticationChainEdit, {
                    args: [
                        encodeURIComponent(dialog.options.data.realmPath),
                        encodeURIComponent(name)
                    ],
                    trigger: true
                });
            }, function (event) {
                Messages.addMessage({
                    type: Messages.TYPE_DANGER,
                    response: event
                });
            });
        } else {
            dialog.getModalBody().find("#alertContainer").html(Handlebars.compile(
                "{{> alerts/_Alert type='warning' text='console.authentication.chains.duplicateChain'}}"
            ));
        }
    }

    return function (realmPath, chains) {
        UIUtils.fillTemplateWithData("templates/admin/views/realms/authentication/chains/AddChainTemplate.html",
        {},
        function (html) {
            BootstrapDialog.show({
                title: $.t("console.authentication.chains.createNewChain"),
                message: $(html),
                buttons: [{
                    label: $.t("common.form.cancel"),
                    action: closeDialog
                }, {
                    label: $.t("common.form.create"),
                    cssClass: "btn-primary",
                    action: validateAndCreate
                }],
                data: {
                    chains: chains,
                    realmPath: realmPath
                }
            });
        });
    };
});
