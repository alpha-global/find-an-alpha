import './item-view';
import * as helper from './helper';
import anime from 'animejs/lib/anime.es.js';

let showFullSearchQuery;

/**
 * Component that displays a list of found alphas.
 */
class ListView extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' });
    }

    connectedCallback() {
        this.render()
    }

    /**
     * Gets the `alphas` attribute in this component and returns it.
     * 
     * @returns Object
     */
    get alphas() {
        const a = this.getAttribute('alphas');
        const alphasParsed = JSON.parse(a);
        return alphasParsed;
    }

    animateWindow() {
        const resultList = this.shadowRoot.querySelector('#result-list');
        anime({
            targets: resultList,
            translateX: 250,
            opacity: 1,
            delay: anime.stagger(200)
        })
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                h2 {
                    color: #ff0000;
                    font-size: 1.2rem;
                }
                .edit-header {
                    display: flex;
                    align-items: center;
                    padding: 15px 5px;
                    border-bottom: 1px solid #c7c7c7;
                    margin-bottom: 15px;
                    justify-content: space-between;
                }

				#results {
					padding: 0 15px;
				}

                #result-list {
                    width: 100%;
                    margin-left: -250px;
                    opacity: 0;
                }
                
                ul {
                    margin: 0;
                    padding: 0;
                }
                
                ul li {
                    border: 1px solid #c7c7c7;
                    border-radius: 10px;
                    padding: 15px 10px;
                    display: flex;
                    justify-content: center;
                    flex-direction: column;
                    flex-wrap: wrap;
                    margin: 15px auto;
                    cursor: pointer;
                    transition: all 1s;
                }

                    ul li:hover {
                        border: 1px solid red;
                        box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
                        -webkit-box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
                        -moz-box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
                    }
                
                ul li h2 {
                    margin: 0
                }
                
                ul li p {
                    margin: 0;
                }

				/* * MOBILE SPECIFIC * */

				#mobile-ul {
					display: inline-flex;
					justify-content: space-between;

				}

				.mobile-ul li {
					flex-wrap: nowrap;
				}

				.mobile-results {
					width: 100%;
					overflow: auto;
				}

				.mobile-result-list {
					display: inline-flex;
					width: auto!important;
					overflow: auto;
				}

				.mobile-result-list li {
					display: inline-flex;
					width: 200px;
					margin-right: 5px;
					border-radius: 0;
				}

				.icon-time-holder {
					display: flex;
					width: 100%;
					align-items: center;
					justify-content: space-between;
				}

            </style>
			<div id="results">
				<ul id="result-list"></ul>
			</div>
        `;
        this.createList();
        this.animateWindow();
		this.renderMobile();
    }

    createList() {
        if (!this.alphas) {
            return;
        }
        const resultsList = this.shadow.getElementById('result-list');
        const nAlphas = helper.alphaWithFriendlyDateTime(this.alphas);
        nAlphas.forEach((el, index) => {
			// Creates and appends the `<li>` element
			const li = document.createElement('li');
			li.id = el.id;
			li.onclick = this.displayItem.bind(this, el);
			resultsList.appendChild(li);

			// Creates and append the title
			const title = document.createElement('h2');
			title.innerText = `${index + 1}. ${el.title}`;
			this.shadow.getElementById(el.id).appendChild(title);

			if (helper.isMobile()) {
				const iconTimeHolder = document.createElement('div');
				iconTimeHolder.classList.add('icon-time-holder')
				iconTimeHolder.innerHTML = `
					<div style="flex: 1;">
						<svg id="email" width="40" style="enable-background:new 0 0 64 64;" version="1.1" viewBox="0 0 64 64" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
							<style type="text/css">.st0{fill:red;}</style>
							<g>
								<g id="Icon-Envelope" transform="translate(78.000000, 232.000000)">
									<path class="st0" d="M-22.5-213.2l-1.9-1.9l-17.6,17.6c-2.2,2.2-5.9,2.2-8.1,0L-67.7-215l-1.9,1.9l13.1,13.1
										l-13.1,13.1l1.9,1.9l13.1-13.1l2.6,2.6c1.6,1.6,3.7,2.5,5.9,2.5s4.3-0.9,5.9-2.5l2.6-2.6l13.1,13.1l1.9-1.9l-13.1-13.1
										L-22.5-213.2" id="Fill-3"/>
									<path class="st0" d="M-26.2-181.6h-39.5c-2.3,0-4.2-1.9-4.2-4.2v-28.2c0-2.3,1.9-4.2,4.2-4.2h39.5
										c2.3,0,4.2,1.9,4.2,4.2v28.2C-22-183.5-23.9-181.6-26.2-181.6L-26.2-181.6z M-65.8-215.5c-0.8,0-1.4,0.6-1.4,1.4v28.2
										c0,0.8,0.6,1.4,1.4,1.4h39.5c0.8,0,1.4-0.6,1.4-1.4v-28.2c0-0.8-0.6-1.4-1.4-1.4H-65.8L-65.8-215.5z" id="Fill-4"/>
								</g>
							</g>
						</svg>
					</div>
					<div style="flex: 1;">
						<svg enable-background="new 0 0 48 48" width="30" id="computer" fill="red" version="1.1" viewBox="0 0 48 48" width="48px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path clip-rule="evenodd" d="M43,35H29.195c0.595,3.301,2.573,5.572,4.401,7H36c0.553,0,1,0.447,1,1  s-0.447,1-1,1H12c-0.553,0-1-0.447-1-1s0.447-1,1-1h2.403c1.827-1.428,3.807-3.699,4.401-7H5c-2.209,0-4-1.791-4-4V8  c0-2.209,1.791-4,4-4h38c2.209,0,4,1.791,4,4v23C47,33.209,45.209,35,43,35z M17.397,42h13.205c-1.595-1.682-3.015-3.976-3.459-7  h-6.287C20.412,38.024,18.992,40.318,17.397,42z M45,8c0-1.104-0.896-2-2-2H5C3.896,6,3,6.896,3,8v19l0,0h42V8z M45,29H3l0,0v2  c0,1.104,0.896,2,2,2h14l0,0h10l0,0h14c1.104,0,2-0.896,2-2V29z M24,32c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1  S24.553,32,24,32z" fill-rule="evenodd"/></svg>
					</div>
					<div style="flex: 3;">${helper.shortDate(el.date)}</div>
				`;
				this.shadow.getElementById(el.id).appendChild(iconTimeHolder);
			} else {
				const dateTime = document.createElement('p');
				dateTime.innerText = el.formattedDate;
				this.shadow.getElementById(el.id).appendChild(dateTime);
			}
        })
    }

    displayItem(alpha) {
        const compAttr = {
            attrName: 'alpha',
            data: JSON.stringify(alpha)
        };
        helper.loadComponent('faa-item', compAttr, this);
        document.querySelector('find-a-course').shadowRoot.querySelector('faa-action-bar').setAttribute('allowback', true);
    }

	renderMobile() {
		if ( helper.isMobile() ) {
			showFullSearchQuery = false;
			this.shadow.querySelector('#results').classList.add('mobile-results');
			this.shadow.querySelector('#result-list').classList.add('mobile-result-list');
			helper.hideShowMap();
			this.setMobileListView();
		}
	}

	setMobileListView() {
		const findCourseElRef = document.querySelector('find-a-course');
		const mapRef = findCourseElRef.shadowRoot.querySelector('#map');
		const formRef = findCourseElRef.shadowRoot.querySelector('faa-form');

		mapRef.style.top = '80px';
		mapRef.style.marginBottom = '80px';
		mapRef.style.display = 'block';

		formRef.style.position = 'absolute';
		formRef.style.top = 0;
		formRef.style.left = 0;
		formRef.style.width = '100%';

		formRef.shadowRoot.querySelector('#filter').addEventListener('click', () => {
			if (showFullSearchQuery) {
				showFullSearchQuery = false;
				helper.mobileSearchBar(formRef);
				this.setMobileListView();
			} else {
				showFullSearchQuery = true;
				helper.mobileSearchBar(formRef, 'block');
				
				mapRef.style.display = 'none';
				formRef.style.position = 'relative';
			}

		})

	}
}

customElements.define('faa-list-view', ListView);
