(function() {
    let _shadowRoot;
    let _id;
    let _score;

    let div;
    let widgetName;
    var Ar = [];

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>      
    `;

    class Zoom extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            //_shadowRoot.querySelector("#oView").id = "oView";

            this._export_settings = {};
            this._export_settings.apiKey = "";
            this._export_settings.apiSecret = "";
            this._export_settings.name = "";
            this._export_settings.meetingNumber = "";
            this._export_settings.meetingPassword = "";

            this.addEventListener("click", event => {
                console.log('click');

            });

            this._firstConnection = 0;
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            var that = this;

            let base64js = "http://localhost/SAC/saczoom/base64.min.js";
            let cryptojs = "http://localhost/SAC/saczoom/crypto-js.min.js";
            let hmacsha256js = "http://localhost/SAC/saczoom/hmac-sha256.min.js";
            let tooljs = "http://localhost/SAC/saczoom/tool.js";

            async function LoadLibs() {
                try {
                    await loadScript(base64js, _shadowRoot);
                    await loadScript(cryptojs, _shadowRoot);
                    await loadScript(hmacsha256js, _shadowRoot);
                    await loadScript(tooljs, _shadowRoot);
                } catch (e) {
                    alert(e);
                } finally {
                    loadthis(that, changedProperties);
                }
            }
            LoadLibs();
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
            console.log("_renderExportButton-components");
            console.log(components);
            console.log("end");
        }

        _firePropertiesChanged() {
            this.unit = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        unit: this.unit
                    }
                }
            }));
        }

        // SETTINGS
        get apiKey() {
            return this._export_settings.apiKey;
        }
        set apiKey(value) {
            console.log("value:" + value);
            this._export_settings.apiKey = value;
        }

        get apiSecret() {
            return this._export_settings.apiSecret;
        }
        set apiSecret(value) {
            this._export_settings.apiSecret = value;
        }

        get name() {
            return this._export_settings.name;
        }
        set name(value) {
            this._export_settings.name = value;
        }

        get meetingNumber() {
            return this._export_settings.meetingNumber;
        }
        set meetingNumber(value) {
            this._export_settings.meetingNumber = value;
        }

        get meetingPassword() {
            return this._export_settings.meetingPassword;
        }
        set meetingPassword(value) {
            this._export_settings.meetingPassword = value;
        }

        static get observedAttributes() {
            return [
                "apiKey",
                "apiSecret",
                "name",
                "meetingNumber",
                "meetingPassword"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-fd-djaja-sap-sac-zoom", Zoom);

    // UTILS
    function loadthis(that, changedProperties) {
        var that_ = that;

        widgetName = changedProperties.widgetName;
        console.log("DDDDDD:" + widgetName);
        if (typeof widgetName === "undefined") {
            widgetName = that._export_settings.title.split("|")[0];
            console.log("DDDDDD__:" + widgetName);
        }

        console.log('footer:' + that._export_settings.footer);

        div = document.createElement('div');
        div.slot = "content_" + widgetName;

        //if(that._firstConnection === 0) {
        console.log("--First Time --");

        let div0 = document.createElement('div');
        div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View height="100%" xmlns="sap.m" xmlns:l="sap.ui.layout" xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" controllerName="myView.Template"><l:VerticalLayout class="sapUiContentPadding" width="100%"><l:content></l:content><Button id="buttonId" class="sapUiTinyMarginBeginEnd" icon="sap-icon://call" text="Zoom" press=".onPress" /></l:VerticalLayout></mvc:View></script>';
        _shadowRoot.appendChild(div0);

        let div1 = document.createElement('div');
        div1.innerHTML = '<?xml version="1.0"?><script id="myXMLFragment_' + widgetName + '" type="sapui5/fragment"><core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><SelectDialog title="Partner Number" class="sapUiPopupWithPadding"  items="{' + widgetName + '>/}" search="_handleValueHelpSearch"  confirm="_handleValueHelpClose"  cancel="_handleValueHelpClose"  multiSelect="true" showClearButton="true" rememberSelections="true"><StandardListItem icon="{' + widgetName + '>ProductPicUrl}" iconDensityAware="false" iconInset="false" title="{' + widgetName + '>partner}" description="{' + widgetName + '>partner}" /></SelectDialog></core:FragmentDefinition></script>';
        _shadowRoot.appendChild(div1);

        let div2 = document.createElement('div');
        div2.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
        _shadowRoot.appendChild(div2);

        that_.appendChild(div);

        var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);
        var mapcanvas_fragment_divstr = _shadowRoot.getElementById('myXMLFragment_' + widgetName);

        Ar.push({
            'id': widgetName,
            'div': mapcanvas_divstr,
            'divf': mapcanvas_fragment_divstr
        });
        console.log(Ar);
        //}

        that_._renderExportButton();

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/ui/model/json/JSONModel",
                "sap/m/MessageToast",
                "sap/ui/core/library",
                "sap/ui/core/Core",
                'sap/ui/model/Filter',
                'sap/m/library',
                'sap/m/MessageBox',
                'sap/ui/unified/DateRange',
                'sap/ui/core/format/DateFormat',
                'sap/ui/model/BindingMode',
                'sap/ui/core/Fragment',
                'sap/m/Token',
                'sap/ui/model/FilterOperator',
                'sap/ui/model/odata/ODataModel',
                'sap/m/BusyDialog',
                'sap/m/Dialog',
                'sap/m/DialogType',
                'sap/ui/layout/HorizontalLayout',
                'sap/ui/layout/VerticalLayout',
                'sap/m/Text',
                'sap/m/TextArea',
                'sap/m/Button',
                'sap/m/ButtonType',
                'sap/m/Label'
            ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox, DateRange, DateFormat, BindingMode, Fragment, Token, FilterOperator, ODataModel, BusyDialog, Dialog, DialogType, HorizontalLayout, VerticalLayout, Text, TextArea, Button, ButtonType, Label) {
                "use strict";

                var busyDialog = (busyDialog) ? busyDialog : new BusyDialog({});

                return Controller.extend("myView.Template", {

                    onInit: function() {

                        console.log("-------oninit--------");

                        console.log(that._export_settings.title);
                        console.log("widgetName:" + that.widgetName);


                        if (that._firstConnection === 0) {
                            that._firstConnection = 1;
                            console.log("that._firstConnection = 0");
                        } else {
                            console.log("that._firstConnection = 1");
                        }
                    },

                    onPress: function() {
                        if (!this.oConfirmDialog) {
                            this.oConfirmDialog = new Dialog({
                                type: DialogType.Message,
                                title: "Zoom Meeting",
                                content: [

                                    new sap.ui.layout.form.SimpleForm({
                                        minWidth: 1024,
                                        maxContainerCols: 2,
                                        title: new sap.ui.core.Title({
                                            text: "Enter Zoom Meeting Details"
                                        }),
                                        content: [
                                            new sap.m.Label({
                                                text: "Meeting Number"
                                            }),
                                            new sap.m.Input("meetingNumber", {
                                                width: "100%",
                                                placeholder: "Enter meeting number"
                                            }),

                                            new sap.m.Label({
                                                text: "Meeting Password"
                                            }),
                                            new sap.m.Input("meetingPassword", {
                                                width: "100%",
                                                placeholder: "Enter meeting password"
                                            }),

                                            new sap.m.Label({
                                                text: "Name"
                                            }),
                                            new sap.m.Input("name", {
                                                width: "100%",
                                                placeholder: "Enter Name"
                                            }),

                                        ]
                                    }),
                                ],
                                beginButton: new Button({
                                    type: ButtonType.Emphasized,
                                    text: "Launch",
                                    press: function() {
                                        var meetingNumber = Core.byId("meetingNumber").getValue();
                                        var meetingPassword = Core.byId("meetingPassword").getValue();
                                        var name = Core.byId("name").getValue();

                                        const data = {
                                            apiKey: that._export_settings.apiKey,
                                            apiSecret: that._export_settings.apiSecret,
                                            meetingNumber: meetingNumber,
                                            meetingPassword: meetingPassword,
                                            role: 0
                                        }
                                        console.log(data);

                                        let testTool = window.testTool;
                                        let username = testTool.b64EncodeUnicode(name)

                                        let signature = '';
                                        // Prevent time sync issue between client signature generation and zoom
                                        const ts = new Date().getTime() - 30000;
                                        const msg = Base64.encode(data.apiKey + data.meetingNumber + ts + data.role);
                                        const hash = CryptoJS.HmacSHA256(msg, data.apiSecret);
                                        signature = Base64.encodeURI(`${data.apiKey}.${data.meetingNumber}.${ts}.${data.role}.${CryptoJS.enc.Base64.stringify(hash)}`);
                                        console.log(signature);

                                        let joinUrl = 'http://127.0.0.1:9999/meeting.html?name=' + username + '&mn=' + data.meetingNumber + '&email=&pwd=' + data.meetingPassword + '&role=0&lang=en-US&signature=' + signature + '&china=0&apiKey=' + data.apiKey;
                                        console.log(joinUrl);

                                        window.open(joinUrl, "_blank");

                                        this.oConfirmDialog.close();
                                    }.bind(this)
                                }),
                                endButton: new Button({
                                    text: "Cancel",
                                    press: function() {
                                        this.oConfirmDialog.close();
                                    }.bind(this)
                                })
                            });
                        }

                        this.oConfirmDialog.open();
                    },


                    wasteTime: function() {
                        busyDialog.open();
                    },

                    runNext: function() {
                        busyDialog.close();
                    },

                });
            });

            console.log("widgetName Final:" + widgetName);
            var foundIndex = Ar.findIndex(x => x.id == widgetName);
            var divfinal = Ar[foundIndex].div;
            console.log(divfinal);

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(divfinal).html(),
            });

            oView.placeAt(div);
            if (that_._designMode) {
                oView.byId("multiInput").setEnabled(false);
                oView.byId("buttonId").setEnabled(false);
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadScript(src, shadowRoot) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => {
                console.log("Load: " + src);
                resolve(script);
            }
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            shadowRoot.appendChild(script)
        });
    }
})();