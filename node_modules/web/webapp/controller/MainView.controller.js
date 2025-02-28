sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "../model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, Fragment, models, Filter, FilterOperator) {
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

            if (!oView) {
                MessageToast.show("Erro ao obter a view.");
                return;
            }

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
            var oModel = this.getView().getModel("notaFiscal");  
            if (!oModel) {
                MessageToast.show("Modelo não inicializado.");
                return; 
            }

            var numeroNota = oModel.getProperty("/numeroNota");
            var valorNota = oModel.getProperty("/valorNota");
            var clienteNome = oModel.getProperty("/Cliente/nome");
            var fornecedorNome = oModel.getProperty("/Fornecedor/nome");

            if (!valorNota || !clienteNome || !fornecedorNome) {
                MessageToast.show("Todos os campos são obrigatórios.");
                return;
            }

            var newNotaFiscal = {
                id: 0,  
                numeroNota: 0,  
                valorNota: parseFloat(valorNota),
                cliente: {
                    id: 0,  
                    nome: clienteNome
                },
                fornecedor: {
                    id: 0,  
                    nome: fornecedorNome
                }
            };

            console.log("Enviando dados:", newNotaFiscal);

            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(newNotaFiscal),
                success: function () {
                    MessageToast.show("Nota Fiscal salva com sucesso.");

                    oModel.setProperty("/numeroNota", "");
                    oModel.setProperty("/valorNota", "");
                    oModel.setProperty("/Cliente/nome", "");
                    oModel.setProperty("/Fornecedor/nome", "");

                    this._oDialog.close();
                    this._oDialog.destroy();
                    this._oDialog = null;


                    this._loadNotaFiscais();
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
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
        },

        onSearchNotaFiscal: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                var oFilter1 = new Filter("numeroNota", FilterOperator.EQ, sQuery); // Use EQ for exact match on numbers
                var oFilter3 = new Filter("cliente/nome", FilterOperator.Contains, sQuery);
                var oFilter4 = new Filter("fornecedor/nome", FilterOperator.Contains, sQuery);
                aFilters = new Filter({
                    filters: [oFilter1, oFilter3, oFilter4],
                    and: false
                });
            }
            var oTable = this.byId("notaFiscalTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

        onShowClienteDetails: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("notaFiscal");

            if (!this._oNotaFiscalFormDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "web.view.NotaFiscalForm",
                    controller: this
                }).then(function (oDialog) {
                    this._oNotaFiscalFormDialog = oDialog;
                    this.getView().addDependent(this._oNotaFiscalFormDialog);
                    this._oNotaFiscalFormDialog.setBindingContext(oContext, "notaFiscal");
                    this._oNotaFiscalFormDialog.open();
                }.bind(this));
            } else {
                this._oNotaFiscalFormDialog.setBindingContext(oContext, "notaFiscal");
                this._oNotaFiscalFormDialog.open();
            }
        },

        onCloseNotaFiscalForm: function () {
            if (this._oNotaFiscalFormDialog) {
                this._oNotaFiscalFormDialog.close();
            }
        },

        onEditNotaFiscal: function () {
            var oModel = this.getView().getModel("notaFiscal");
            var oContext = this._oNotaFiscalFormDialog.getBindingContext("notaFiscal");
            var oData = oContext.getObject();

            var updatedNotaFiscal = {
                id: oData.id,
                numeroNota: parseInt(this.byId("numeroNotaInput").getValue(), 10),
                valorNota: parseFloat(this.byId("valorNotaInput").getValue()),
                cliente: {
                    id: oData.cliente.id,
                    nome: this.byId("clienteNomeInput").getValue()
                },
                fornecedor: {
                    id: oData.fornecedor.id,
                    nome: this.byId("fornecedorNomeInput").getValue()
                }
            };

            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal/" + updatedNotaFiscal.id,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(updatedNotaFiscal),
                success: function () {
                    MessageToast.show("Nota Fiscal atualizada com sucesso.");
                    this._oNotaFiscalFormDialog.close();
                    this._loadNotaFiscais();
                }.bind(this),
                error: function () {
                    MessageToast.show("Erro ao atualizar a Nota Fiscal.");
                }
            });
        },

        onDeleteNotaFiscal: function () {
            var oContext = this._oNotaFiscalFormDialog.getBindingContext("notaFiscal");
            var oData = oContext.getObject();

            $.ajax({
                url: "http://localhost:5136/api/NotaFiscal/" + oData.id,
                method: "DELETE",
                success: function () {
                    MessageToast.show("Nota Fiscal deletada com sucesso.");
                    this._oNotaFiscalFormDialog.close();
                    this._loadNotaFiscais();
                }.bind(this),
                error: function () {
                    MessageToast.show("Erro ao deletar a Nota Fiscal.");
                }
            });
        }
    });
});
