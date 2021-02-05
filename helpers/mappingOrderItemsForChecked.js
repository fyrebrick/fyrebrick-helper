module.exports = (data) => {
	let d = new Map();
	data.forEach(item=>{
		item.forEach( (i) => {
			d.set(i.inventory_id,i.isChecked);
		})
	})
	return d;
}