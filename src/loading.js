class Loading extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' } );
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                #backdrop {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    position: relative;
                    background: rgba(255,255,255,.6);
                    align-items: center;
                    justify-content: center;
                    top: 0;
                    left: 0
                }

                .lds-dual-ring {
                    display: inline-block;
                    width: 80px;
                    height: 80px;
                }

                    .lds-dual-ring:after {
                        content: " ";
                        display: block;
                        width: 64px;
                        height: 64px;
                        margin: 8px;
                        border-radius: 50%;
                        border: 6px solid #e42312;
                        border-color: transparent #e42312 transparent;
                        animation: lds-dual-ring 1.2s linear infinite;
                    }
                    
                @keyframes lds-dual-ring {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            </style>
            <div id="backdrop">
                <div class="lds-dual-ring"></div>
            </div>
        `
    }
}

customElements.define('faa-load', Loading);
