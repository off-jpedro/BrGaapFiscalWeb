sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("web.controller.AddNotaFiscal", {

        onFieldChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();  // Pega o valor digitado
            var sPath = oInput.getBindingContext("notaFiscal").getPath();  // Caminho do campo no modelo
            this.getView().getModel("notaFiscal").setProperty(sPath, sValue);  // Atualiza o modelo com o novo valor
        },

        onSaveNotaFiscal: function () {
            // Chamar a função onSaveNotaFiscal no controlador principal
            var oMainView = sap.ui.getCore().byId("MainView");
            var oMainController = oMainView.getController();
            oMainController.onSaveNotaFiscal();
        },

        onCancel: function () {
            var oDialog = this.getView().getParent();
            if (oDialog) {
                oDialog.close();
                oDialog.destroy();
            }
        }
    });
});
