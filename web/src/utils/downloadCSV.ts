 
export const downloadCSV = (data: string[][], name: string) => {

	let csv = ""
	
	data.forEach(elem => {

		csv += elem.map(e => e.replace(/[^a-zA-Z0-9]/g,' ')).join(",")
		csv += "\n"
	})
	
	const hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
	hiddenElement.target = '_blank';
	hiddenElement.download = `${name}.csv`; 
	hiddenElement.click();
}