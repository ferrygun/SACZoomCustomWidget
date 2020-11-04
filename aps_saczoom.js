(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
          fieldset {
              margin-bottom: 10px;
              border: 1px solid #afafaf;
              border-radius: 3px;
          }
          table {
              width: 100%;
          }
          input, textarea, select {
              font-family: "72",Arial,Helvetica,sans-serif;
              width: 100%;
              padding: 4px;
              box-sizing: border-box;
              border: 1px solid #bfbfbf;
          }
          input[type=checkbox] {
              width: inherit;
              margin: 6px 3px 6px 0;
              vertical-align: middle;
          }
      </style>
      <form id="form" autocomplete="off">
        <fieldset> 
          <legend>General</legend>
          <table>
            <tr>
              <td><label for="API Key">API Key</label></td>
              <td><input id="apiKey" name="apiKey" type="text"></td>
            </tr>
            <tr>
              <td><label for="API Secret">API Secret</label></td>
              <td><input id="apiSecret" name="apiSecret" type="text"></td>
            </tr>
            <tr>
              <td><label for=Name">Name</label></td>
              <td><input id="name" name="name" type="text"></td>
            </tr>
            <tr>
              <td><label for="Meeting Number">Meeting Number</label></td>
              <td><input id="meetingNumber" name="meetingNumber" type="text"></td>
            </tr>
            <tr>
              <td><label for="Meeting Password">Meeting Password</label></td>
              <td><input id="meetingPassword" name="meetingPassword" type="text"></td>
            </tr>
          </table>
        </fieldset>
        <button type="submit" hidden>Submit</button>
      </form>
    `;

    class ZoomAps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            let form = this._shadowRoot.getElementById("form");
            form.addEventListener("submit", this._submit.bind(this));
            form.addEventListener("change", this._change.bind(this));
        }

        connectedCallback() {
        }

        _submit(e) {
            e.preventDefault();
            let properties = {};
            for (let name of ZoomAps.observedAttributes) {
                properties[name] = this[name];
            }
            this._firePropertiesChanged(properties);
            return false;
        }
        _change(e) {
            this._changeProperty(e.target.name);
        }
        _changeProperty(name) {
            let properties = {};
            properties[name] = this[name];
            this._firePropertiesChanged(properties);
        }

        _firePropertiesChanged(properties) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }

        get apiKey() {
            return this.getValue("apiKey");
        }
        set apiKey(value) {
            this.setValue("apiKey", value);
        }

        get apiSecret() {
            return this.getValue("apiSecret");
        }
        set apiSecret(value) {
            this.setValue("apiSecret", value);
        }

        get name() {
            console.log(this.getValue("name"));
            return this.getValue("name");
        }
        set name(value) {
            this.setValue("name", value);
        }

        get meetingNumber() {
            return this.getValue("meetingNumber");
        }
        set meetingNumber(value) {
            this.setValue("meetingNumber", value);
        }        

        get meetingPassword() {
            return this.getValue("meetingPassword");
        }
        set meetingPassword(value) {
            this.setValue("meetingPassword", value);
        }   

        getValue(id) {
            return this._shadowRoot.getElementById(id).value;
        }
        setValue(id, value) {
            this._shadowRoot.getElementById(id).value = value;
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
    customElements.define("com-fd-djaja-sap-sac-zoom-aps", ZoomAps);
})();