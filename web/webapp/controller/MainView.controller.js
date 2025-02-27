sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "../model/models"
], function (Controller, JSONModel, MessageToast, Fragment, models) {
    "use strict";

    return Controller.extend("web.controller.MainView", {

        onInit: function () {
            var oViewModel = models.createNotaFiscalModel();
            this.getView().setModel(oViewModel, "notaFiscal");
            this._loadNotaFiscais();
        },

        _loadNotaFiscais: function () {
            var oModel = this.getView().getModel("notaFiscal");
            // Chamar a API para obter as notas fiscais
            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal",
                method: "GET",
                success: function (data) {
                    oModel.setProperty("/NotaFiscais", data);
                    if (!data || data.length === 0) {
                        MessageToast.show("Nenhuma nota fiscal encontrada.");
                    }
                },
                error: function () {
                    MessageToast.show("Erro ao carregar notas fiscais.");
                }
            });
        },

        onAddNotaFiscal: function () {
            // Carregar o fragmento do diálogo
            if (!this.oDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "web.view.AddNotaFiscal",
                    controller: this
                }).then(function (oDialog) {
                    this.oDialog = oDialog;
                    this.getView().addDependent(this.oDialog);
                    this.oDialog.open();
                }.bind(this));
            } else {
                this.oDialog.open();
            }
        }
    });
});