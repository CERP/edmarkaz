
export default function getSupplierSection(supplier_id: string): SUPPLIER_TYPE {

	switch(supplier_id) {
		case "finca": 
		case "jsbank":
		case "telenor":
		case "kashf":
		case "creditfix":
		case "kashif-test":
			return "FINANCE"
		
		case "javed":
			return "TEXTBOOKS"
		
		case "alif-laila":
		case "azcorp":
		case "storykit":
			return "OTHER_BOOKS"
		
		case "sabaq":
		case "edkasa":
		case "radec":
			return "EDTECH"
		
		case "shaukut-sons":
			return "STATIONARY"
		
		case "alliedsolar":
			return "SOLAR"
		
		default:
			return "UNKNOWN"
	}
}