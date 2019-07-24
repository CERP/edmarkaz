 
export const downloadCSV = (data: String[][], name: string) => {

	let csv = ""
	
	data.forEach(elem => {
		csv += elem.join(",")
		csv += "\n"
	})
	
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
	hiddenElement.target = '_blank';
	hiddenElement.download = `${name}.csv`;
	hiddenElement.click();
}