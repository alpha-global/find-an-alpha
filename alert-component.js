import anime from 'animejs/lib/anime.es.js';

/**
 * Global Component to display alerts. It listens to 2 attributes,
 * `iserror` and 'message'.
 */
class Alert extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' } );
    }

    /**
     * Gets the component attribute 'iserror' If TRUE it means
     * it's an error.
     * @returns boolean
     */
    get isError() {
        return this.getAttribute('iserror');
    }

    /**
     * Gets the component attribute for the message. If it's an
     * error or not, there should be a message.
     * @returns string
     */
    get message() {
        return this.getAttribute('message');
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.listenToClick();
        this.shadow.innerHTML = `
            <style>
                #backdrop {
                    width: 100%;
                    height: 100%;
                    background: rgba(255,255,255,.6);
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                #alert-container {
                    width: 40%;
                    background: #FFF;
                    -webkit-box-shadow: 0px 0px 21px -8px #000000; 
                    box-shadow: 0px 0px 21px -8px #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    padding: 15px;
                    flex-direction: column;
                }

                #close-button {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    opacity: .4;
                    width: 25px;
                    content: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Ik91dGxpbmVkIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlLz48ZyBpZD0iRmlsbCI+PHBhdGggZD0iTTE2LDJBMTQsMTQsMCwxLDAsMzAsMTYsMTQsMTQsMCwwLDAsMTYsMlptMCwyNkExMiwxMiwwLDEsMSwyOCwxNiwxMiwxMiwwLDAsMSwxNiwyOFoiLz48cG9seWdvbiBwb2ludHM9IjE5LjU0IDExLjA1IDE2IDE0LjU5IDEyLjQ2IDExLjA1IDExLjA1IDEyLjQ2IDE0LjU5IDE2IDExLjA1IDE5LjU0IDEyLjQ2IDIwLjk1IDE2IDE3LjQxIDE5LjU0IDIwLjk1IDIwLjk1IDE5LjU0IDE3LjQxIDE2IDIwLjk1IDEyLjQ2IDE5LjU0IDExLjA1Ii8+PC9nPjwvc3ZnPg==');
                }

                h2 {
                    color: red;
                }

                h3 {
                    color: #3c3c3c;
                }

                .alert-icon {
                    width: 20%;
                    height: auto;
                }

                #errorIcon {
                    fill: red;
                }
            </style>
            <div id="backdrop">
                <div id="alert-container">
                </div>
            </div>
        `;
        this.animateWindow();
        this.sortAlertType();
    }

    /**
     * Checks what type of alert should be presented.
     */
    sortAlertType() {
        this.isError ? this.renderError() : this.renderSuccess();
    }

    /**
     * Renders a success alert window.
     */
    renderSuccess() {
        console.log('success');
    }

    /**
     * Renders an Error alert window.
     */
    renderError() {
        const alertContainer = this.shadow.querySelector('#alert-container');
        alertContainer.innerHTML = `
            <div id="close-button"></div>
            <div class="alert-icon">
                <?xml version="1.0" ?>
                <svg enable-background="new 0 0 52 52" id="errorIcon" version="1.1" viewBox="0 0 52 52" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g>
                        <path d="M49.4656715,41.2599487l-20.25-34.4099731C28.5256691,5.6900024,27.3256569,5,25.9956398,5
                                c-1.3200073,0-2.5299683,0.6900024-3.2099609,1.8499756l-20.25,34.4099731
                                c-0.710022,1.2000122-0.7200317,2.6400146-0.0300293,3.8500366C3.1856432,46.289978,4.3956652,47,5.7456408,47h40.5100098
                                c1.3499756,0,2.5599976-0.710022,3.2299805-1.8900146C50.1856422,43.8999634,50.1756325,42.4599609,49.4656715,41.2599487z
                                M23.9363747,19.8552856h3.3808594v3.1870117l-0.7246094,8.9189453H24.660984l-0.7246094-8.9189453V19.8552856z
                                M26.9065895,37.1985474c-0.3540039,0.3623047-0.7768555,0.5439453-1.2675781,0.5439453
                                c-0.4912109,0-0.9140625-0.1816406-1.2680664-0.5439453c-0.3544922-0.3623047-0.53125-0.7939453-0.53125-1.296875
                                c0-0.5019531,0.1767578-0.9345703,0.53125-1.296875c0.3540039-0.3623047,0.7768555-0.5439453,1.2680664-0.5439453
                                c0.4907227,0,0.9135742,0.1816406,1.2675781,0.5439453s0.53125,0.7949219,0.53125,1.296875
                                C27.4378395,36.4046021,27.2605934,36.8362427,26.9065895,37.1985474z"/>
                    </g>
                </svg>
            </div>
            <h3>${this.message}</h3>
        `;

        // Animation
        anime({
            target: alertContainer.querySelector('.alert-icon'),
            scale: .8
        });
    }

    /**
     * Initial animation for the component.
     */
    animateWindow() {
        const errorContainer = this.shadow.querySelector('#alert-container');
        anime({
            targets: errorContainer,
            scale: 1.1
        })
    }

    /**
     * Listen to clicks on this component.
     */
    listenToClick() {
        // Dismiss alert.
        this.shadow.addEventListener('click', (event) => {
            if (event.target.id === 'close-button') {
                this.dismissAlert();
            }
        })
    }

    /**
     * Dismiss the alert window.
     */
    dismissAlert() {
        const errorContainer = this.shadow.querySelector('#alert-container');
        anime({
            targets: errorContainer,
            scale: 0,
            duration: 500,
            complete: () =>{ this.remove() }
        });
    }
}

customElements.define('faa-alert', Alert);
