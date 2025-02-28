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
            var oViewModel = new JSONModel({
                NotaFiscais: [],
                valorNota: "",
                Cliente: { nome: "" },
                Fornecedor: {nome: "" }
            });
            this.getView().setModel(oViewModel, "notaFiscal");
            this._loadNotaFiscais();
        },

        _loadNotaFiscais: function () {
            var oModel = this.getView().getModel("notaFiscal");

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
            var oView = this.getView();

            // Verificar se a view foi obtida corretamente
            if (!oView) {
                MessageToast.show("Erro ao obter a view.");
                return;
            }

            // Se o diálogo ainda não foi criado, carregar o fragmento
            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "web.view.AddNotaFiscal",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oDialog = oDialog;
                    this._oDialog.setModel(this.getView().getModel("notaFiscal"), "notaFiscal");
                    oDialog.open();
                }.bind(this)).catch(function (oError) {
                    MessageToast.show("Erro ao carregar o fragmento: " + oError.message);
                });
            } else {
                this._oDialog.setModel(this.getView().getModel("notaFiscal"), "notaFiscal");
                this._oDialog.open();
            }
        },

        onSaveNotaFiscal: function () {
            var oModel = this.getView().getModel("notaFiscal");  // Acessando o modelo corretamente

            // Verificar se o modelo foi inicializado corretamente
            if (!oModel) {
                MessageToast.show("Modelo não inicializado.");
                return; // Se o modelo não existe, interrompe a execução
            }

            var numeroNota = oModel.getProperty("/numeroNota");
            var valorNota = oModel.getProperty("/valorNota");
            var clienteNome = oModel.getProperty("/Cliente/nome");
            var fornecedorNome = oModel.getProperty("/Fornecedor/nome");

            // Verificar se todos os campos obrigatórios estão preenchidos
            if (!valorNota || !clienteNome || !fornecedorNome) {
                MessageToast.show("Todos os campos são obrigatórios.");
                return;
            }

            var newNotaFiscal = {
                id: 0,  // Novo registro, id é 0
                numeroNota: 0,  // Convertendo para Int32
                valorNota: parseFloat(valorNota),
                cliente: {
                    id: 0,  // Novo cliente, id é 0
                    nome: clienteNome
                },
                fornecedor: {
                    id: 0,  // Novo fornecedor, id é 0
                    nome: fornecedorNome
                }
            };

            // Log dos dados que estão sendo enviados
            console.log("Enviando dados:", newNotaFiscal);

            // Enviar a nota fiscal para a API
            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(newNotaFiscal),
                success: function () {
                    MessageToast.show("Nota Fiscal salva com sucesso.");

                    // Resetar os campos do modelo
                    oModel.setProperty("/numeroNota", "");
                    oModel.setProperty("/valorNota", "");
                    oModel.setProperty("/Cliente/nome", "");
                    oModel.setProperty("/Fornecedor/nome", "");

                    // Fechar o diálogo
                    this._oDialog.close();
                    this._oDialog.destroy();
                    this._oDialog = null;

                    // Atualizar lista de notas fiscais
                    this._loadNotaFiscais();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    // Log dos detalhes do erro
                    console.log("Erro ao salvar a Nota Fiscal:", textStatus, errorThrown, jqXHR.responseText);
                    MessageToast.show("Erro ao salvar a Nota Fiscal.");
                }
            });
        },

        onCancel: function () {
            if (this._oDialog) {
                this._oDialog.close();
                this._oDialog.destroy();
                this._oDialog = null;
            }
        }
    });
});
