import { RouteInfo } from '../types';
import View from './view';

// 해쉬값에 따라 어떤 함수를 실행하여 사용자에게 제공할 것인지리를 판단하는 함수.
// 화면 전환의 주요 쟁점
export default class Router {
	routeTable: RouteInfo[];
	defaultRoute: RouteInfo | null;

	constructor() {
		// console.log(routePath); // #/page/(number)
		window.addEventListener('hashchange', this.route.bind(this));
	
		this.routeTable = [];
		this.defaultRoute = null;
	}

	setDefaultPage(page:View): void {
		this.defaultRoute = {path:'', page}
	}

	addRoutePath(path: string, page: View): void {
		this.routeTable.push({path, page});
	}

	route():void {
		const routePath = location.hash;

		if(routePath === '' && this.defaultRoute) {
			this.defaultRoute.page.render(); // abstract를 통한 render() 의 사용
		}

		for (const routeInfo of this.routeTable) {
			if ( routePath.indexOf(routeInfo.path) >= 0) {
				routeInfo.page.render(); // abstract를 통한 render() 의 사용
				break;
			}
		}
	}

}