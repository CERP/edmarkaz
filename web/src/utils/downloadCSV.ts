 
export const downloadCSV = (data: String[][], name: string) => {

	let csv = ""
	
	data.forEach(elem => {

		csv += elem.map(e => e.replace(/[^a-zA-Z0-9]/g,' ')).join(",")
		csv += "\n"
	})
	
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
	hiddenElement.target = '_blank';
	hiddenElement.download = `${name}.csv`; 
	hiddenElement.click();
}