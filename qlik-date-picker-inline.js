define( [ "qlik", "./lightpick", "./moment", "css!./lightpick.css"],
function (qlik, Lightpick, moment) {
	
	return {
		initialProperties: {
			version : 1.0,  
            qListObjectDef : {
                qInitialDataFetch : [{  
                    qWidth : 1,  
                    qHeight : 1e4  
                }]  
            }
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					label: "Date Field",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						dimension: {
							type: "string",
							expression: "optional",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							label: "Input Date Field"
						}
					}
				},
				appearance: {
					uses: "settings"
				}
			}
		},
		paint: function ($element, layout) {

			var self = this
			var allDates = layout.qListObject.qDataPages[0].qMatrix
			var minDate = moment(allDates[0][0].qText, "D/M/YYYY")
			var maxDate = moment(allDates[allDates.length - 1][0].qText, "D/M/YYYY")
			// console.log(allDates)
			// console.log(layout)
			// console.log("min date: ", minDate)
			// console.log("max date: ", maxDate)

			// add input field to display data range
			$element.html( '<input type="text" id="datepicker" size="35" /> <br />' );

			// helper function: check if a date falls in a date range
			var checkDateInBetween = function(searchDate, start, end) {
				return searchDate.isBetween(start, end, 'date', '[]')
			}
			
			// Initialise the picker
			var picker = new Lightpick({
				inline: true,
				singleDate: false,
				minDate: minDate,
				maxDate: maxDate,
				numberOfMonths: 2,
				// numberOfColumns: 1,
				field: document.getElementById('datepicker'),
				dropdowns: {
					years: {
						min: minDate.year(),
						max: maxDate.year()
					},
					months: true
				},
				onSelect: function(start, end){
					if (!start || !end) return;
					if ((typeof start._i == 'number') && (typeof end._i == 'number')) {

						// Convert start & end moment to date string
						var startDateString = start.format('D/M/YYYY')
						var endDateString = end.format('D/M/YYYY')
						
						// Populate all the dates in between of the range
						toBeSelected = []
						allDates.forEach(qDate => {
							if (checkDateInBetween(moment(qDate[0].qText, "D/M/YYYY"), start, end)) {
								toBeSelected.push(qDate[0].qElemNumber)
							}
						});
						// console.log(toBeSelected)

						// Select the dates
						self.backendApi.selectValues(0, toBeSelected, false)
					}
				}
			});

			// Go to maxDate
			picker.gotoDate(maxDate.subtract(1, 'month'))

			// Get current selection if there are any
			var selectedDates = []
			allDates.forEach(qDate => {
				if (qDate[0].qState == "S") {
					selectedDates.push(moment(qDate[0].qText, "D/M/YYYY"))
				}
			});
			// console.log(selectedDates)
			if (selectedDates.length > 0) {
				selectedDates = selectedDates.sort((a,b) => a-b)
				minSelectDate = selectedDates[0]
				maxSelectDate = selectedDates[selectedDates.length - 1]
				picker.setDateRange(minSelectDate, maxSelectDate, true)
				picker.gotoDate(maxSelectDate.subtract(1, 'month'))
			}

			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

