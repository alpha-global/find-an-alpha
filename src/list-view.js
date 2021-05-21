import './item-view';
import anime from 'animejs/lib/anime.es.js';
import { isMobile, alphaWithFriendlyDateTime, shortDate, loadComponent, hideShowMap, mobileSearchBar, translationObject, getConfig } from './helper';

let showFullSearchQuery;
const onlineIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);">
	<path d="M3 3h14c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1zm13 2H4v8h12V5zm-3 1H5v4zm6 11v-1H1v1c0 .6.5 1 1.1 1h15.8c.6 0 1.1-.4 1.1-1z" fill="#e42312"/>
</svg>`;

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
                    color: #e42312;
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
					border: 1px solid #e42312;
					box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
					-webkit-box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
					-moz-box-shadow: 1px 7px 34px -14px rgba(0,0,0,0.75);
				}
                
                ul li h2 {
					margin: 0 0 5px 0;
                }
                
                ul li p {
					margin: 0;
                }
				
				#few-results {
					color: var(--color-primary);
					padding: 0 15px;
					margin-bottom: 20px;
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
			<p id="few-results" style="margin-top: ${isMobile() ? '0' : '55px'}"></p>
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

		// If the results are less than 3
		if (this.alphas.length < 3) {
			this.displayFewResultsBlock();
		}
        const resultsList = this.shadow.getElementById('result-list');
        const nAlphas = alphaWithFriendlyDateTime(this.alphas);
        nAlphas.forEach((el, index) => {
			// Creates and appends the `<li>` element
			const li = document.createElement('li');
			li.id = el.id;
			li.onclick = this.displayItem.bind(this, el);
			resultsList.appendChild(li);

			// Creates and append the title
			const title = document.createElement('h2');
			title.innerHTML = `${index + 1}. ${el.title} ${!isMobile() ? (el.onlineDelivery === 'Online' ? onlineIcon : '') : ''}`;
			this.shadow.getElementById(el.id).appendChild(title);

			if (isMobile()) {
				const iconTimeHolder = document.createElement('div');
				iconTimeHolder.innerHTML = `
					<div class="icon-time-holder">
						<div style="flex: 1; display: ${el.onlineDelivery === 'Online' ? 'block' : 'none'}">
							<svg enable-background="new 0 0 48 48" width="30" id="computer" fill="#e42312" version="1.1" viewBox="0 0 48 48" width="48px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
								<path clip-rule="evenodd" d="M43,35H29.195c0.595,3.301,2.573,5.572,4.401,7H36c0.553,0,1,0.447,1,1
									s-0.447,1-1,1H12c-0.553,0-1-0.447-1-1s0.447-1,1-1h2.403c1.827-1.428,3.807-3.699,4.401-7H5c-2.209,0-4-1.791-4-4V8
									c0-2.209,1.791-4,4-4h38c2.209,0,4,1.791,4,4v23C47,33.209,45.209,35,43,35z M17.397,42h13.205c-1.595-1.682-3.015-3.976-3.459-7
									h-6.287C20.412,38.024,18.992,40.318,17.397,42z M45,8c0-1.104-0.896-2-2-2H5C3.896,6,3,6.896,3,8v19l0,0h42V8z M45,29H3l0,0v2
									c0,1.104,0.896,2,2,2h14l0,0h10l0,0h14c1.104,0,2-0.896,2-2V29z M24,32c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1
									S24.553,32,24,32z" fill-rule="evenodd"/>
							</svg>
						</div>
						<div style="flex: 3;">${shortDate(el.date)}</div>
					</div>
					<div style="width: 100%; display: block">
						${el.location.address ? el.location.address : el.formatted_address}
					</div>
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
        loadComponent('faa-item', compAttr, this);
        document.querySelector('find-a-course').shadowRoot.querySelector('faa-action-bar').setAttribute('allowback', true);
    }

	renderMobile() {
		if ( isMobile() ) {
			showFullSearchQuery = false;
			this.shadow.querySelector('#results').classList.add('mobile-results');
			this.shadow.querySelector('#result-list').classList.add('mobile-result-list');
			hideShowMap();
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
				mobileSearchBar(formRef);
				this.setMobileListView();
			} else {
				showFullSearchQuery = true;
				mobileSearchBar(formRef, 'block');
				
				mapRef.style.display = 'none';
				formRef.style.position = 'relative';
			}

		})

		this.shadow.querySelector('#results').style.marginTop = 0;

	}

	displayFewResultsBlock() {
		const translation = translationObject()?.errorLimitedResults || 'Only {$NUM} result(s) were found with your search criteria. Try broadening your search radius to find more Alphas.';
		if ( getConfig().src === 'mb') {
			this.shadow.getElementById('few-results').innerText = translation.replace('{{num}}', this.alphas.length);
		} else {
			this.shadow.getElementById('few-results').innerText = translation.replace('{$NUM}', this.alphas.length);
		}
	}
}

customElements.define('faa-list-view', ListView);
