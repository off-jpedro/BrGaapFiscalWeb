sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("web.controller.AddNotaFiscal", {

        onInit: function () {
            // Criar um modelo JSON para armazenar os dados da nota fiscal
            var oNotaFiscalModel = new JSONModel({
                numeroNota: "",
                valorNota: "",
                cliente: { nome: "" },
                fornecedor: { nome: "" }
            });

            this.getView().setModel(oNotaFiscalModel, "notaFiscal");
        },

        onOpenDialog: function () {
            var oView = this.getView();

            // Se o diálogo ainda não foi criado, carregar o fragmento
            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "web.view.AddNotaFiscal",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        onSaveNotaFiscal: function () {
            var oModel = this.getView().getModel("notaFiscal");
            var newNotaFiscal = {
                numeroNota: oModel.getProperty("/numeroNota"),
                valorNota: parseFloat(oModel.getProperty("/valorNota")),
                cliente: {
                    nome: oModel.getProperty("/cliente/nome")
                },
                fornecedor: {
                    nome: oModel.getProperty("/fornecedor/nome")
                }
            };

            // Chamar API para salvar a nota fiscal
            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(newNotaFiscal),
                success: function () {
                    MessageToast.show("Nota Fiscal salva com sucesso.");

                    // Fechar o diálogo e limpar o modelo
                    oModel.setData({
                        numeroNota: "",
                        valorNota: "",
                        cliente: { nome: "" },
                        fornecedor: { nome: "" }
                    });

                    this._oDialog.close();

                    // Recarregar lista de notas fiscais
                    this.getOwnerComponent().getRouter().navTo("MainView");
                }.bind(this),
                error: function () {
                    MessageToast.show("Erro ao salvar a Nota Fiscal.");
                }
            });
        },

        onCancel: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        }
    });
});
