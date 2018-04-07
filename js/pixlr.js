let pixlr = {
    grid: {
        element: document.getElementById('pixel_canvas'),
        background: {
            element: document.getElementById('canvas_bg'),
            change: () => { // function to change the grid's background color 
                pixlr.grid.element.style.backgroundColor = pixlr.grid.background.element.value; // set background color to new color currently set 
                pixlr.message.log('Background color changed to ' + pixlr.grid.background.element.value, 2);
            }
        },
        get_height: () => { // function to get the current height 
            return document.getElementById('input_height').value;
        },
        get_width: () => { // function to get the current width 
            return document.getElementById('input_width').value;
        },
        clear: () => { // clear the canvas 
            pixlr.grid.element.innerHTML = ''; // clear canvas 
            pixlr.message.log('Grid has been cleared.', 1); // let user know grid has been cleared 
        },
        erase: (cell) => {
            cell.style.backgroundColor = 'transparent'; // clear color from cell
        },
        update: (cell) => {
            const color = document.getElementById('color_picker').value; // get color from color picker
            cell.style.backgroundColor = color; // update cell clicked
            pixlr.colors.record(color); // records current color 
            pixlr.colors.update(); // updates colors 
        },
        transparent: () => {
            pixlr.grid.element.style.backgroundColor = 'transparent'; // set background color to transparent 
            // let user know the background color is now transparent 
            pixlr.message.log('Grid background is now transparent.');
        },
        borders: {
            toggle: (status) => {
                let elements = document.querySelectorAll('#pixel_canvas *'), // get all children of #pixel_canvas 
                    count = elements.length; // count of children in elements variable 
                while (count--) { // while count is positive, once it hits -1 it will return false 
                    // set the color of this child to none if status is undefined or to light gray if otherwise. 
                    elements[count].style.border = (status === undefined) ? 'none' : '1px solid #d1d1d1';
                }
            }
        }
    },
    pixels: {
        element: document.getElementById('saved_pixel'),
        save: () => {
            pixlr.grid.borders.toggle(); // remove the borders 
            /**
             * This function is part of a 3rd party JS library. html2canvas(element, options).then(canvas) -> what to do with it after it has been created;
             */
            html2canvas(pixlr.grid.element, {
                backgroundColor: null
            }).then((canvas) => {
                pixlr.pixels.element.appendChild(canvas); // add canvas element to list of pixels 
                pixlr.grid.borders.toggle(true); // add borders 
                pixlr.message.log('New pixel has been saved. Check preview!', 1);
            });
        }
    },
    message: {
        /**
         * Array of messages to utilize throughout the application
         */
        collection: {
            colors: ['Selecting this color again?', 'Oldie, but a goodie!', 'This color choice is still awesome!', 'Definitely one of your favorite colors.'],
            picker: ['Awesome new color!', 'Bit on the wild side, no?', 'Adventurous color choice!', 'It\'s a bit... meh?']
        },
        element: document.getElementById('pixlr_console'),
        /**
         * This function helps with creating messages to log to the console (pseudo-console)
         * It takes a message and the type of message, then it applies a class depending on the type of message.
         */
        log: (message, type) => { // message to log, type of message to log 
            let element = pixlr.message.element;
            type === 1 ? element.className = 'success-message' :
                type === 2 ? element.className = 'warning-message' :
                type === 3 ? element.className = 'error-message' :
                element.className = 'normal-message';
            pixlr.message.element.innerText = message;
        }
    },
    status: {
        /*
         * This property holds status objects - these keep track of the status of items throughout the app
         */
        isMouseDown: false,
        isEraserDown: false
    },
    colors: {
        element: document.querySelector('#color_history tr'),
        picker: document.getElementById('color_picker'),
        history: [], // array holds the colors used in the past 
        clear: () => {
            pixlr.colors.element.innerHTML = ""; // clears your color history 
        },
        update: () => {
            const history = pixlr.colors.element; // color history row
            pixlr.colors.clear(); // clear color history 

            // loop over current colors in history 
            for (let i = 0; i < pixlr.colors.history.length; i += 1) {
                let color_cell = history.insertCell(0); //add cell for current color
                color_cell.style.backgroundColor = pixlr.colors.history[i][0]; //fill in with current color

                // add event listener to color history cells 
                color_cell.addEventListener('click', () => {
                    // get current color 
                    const brush_color = pixlr.colors.picker.value;

                    // if brush color does not equal color being clicked
                    if (brush_color !== color_cell.style.backgroundColor) {
                        // set brush color to history color 
                        pixlr.colors.picker.value = pixlr.colors.history[i][0]; //use color when clicked
                        // load a random message to pseudo console 
                        pixlr.message.log(pixlr.message.collection.colors[pixlr.util.rand(0, 3)], 1);
                    } else {
                        // if brush color is the same as color clicked in history, let user know
                        pixlr.message.log('You\'re already using that color!', 3);
                    }

                });
            }
        },
        sort: () => {
            // this sorts the color history 
            pixlr.colors.history.sort((a, b) => {
                return a[1] - b[1];
            })
        },
        record: (color) => {
            // records colors being used in to the color history 
            let isNew = false, // is color new, default is false, will use below 
                l = pixlr.colors.history.length; // length of history 

            // quick loop over colors history
            while (l--) {
                if (pixlr.colors.history[l][0] === color) { // if color is in history
                    pixlr.colors.history[l][1] += 1; // add to that color's count
                    isNew = true; // trigger status to on
                }
            }

            if (!isNew) { // if status is not triggered, its a new color
                pixlr.colors.history.push([color, 1]); // push new color in to history
            }

            pixlr.colors.sort(); // sort color history by usage [color, usage]
        },
        slider: {
            red: document.getElementById('pixlr_red'),
            blue: document.getElementById('pixlr_blue'),
            green: document.getElementById('pixlr_green'),
            update: () => {
                /* 
                 * This function updates the color picker. It converts our R/G/B to HEX.
                 */
                pixlr.colors.picker.value = pixlr.colors.convert('rgb(' + pixlr.colors.slider.red.value + ', ' + pixlr.colors.slider.green.value + ', ' + pixlr.colors.slider.blue.value + ')', 'rgb');
            }
        },
        rgb: (color) => {
            color = color.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (color && color.length === 4) ? "#" +
                ("0" + parseInt(color[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(color[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(color[3], 10).toString(16)).slice(-2) : '';
        },
        hex: (hex) => {
            /**
             * Hex to RGB 
             * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
             */
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        convert: (color, type) => { // function triggers conversion - you pass in the color and type of conversion 
            return type === 'rgb' ? pixlr.colors.rgb(color) : pixlr.colors.hex(color);
        }
    },
    util: {
        rand: (min, max) => { // return random number between minimum and maximum 
            return Math.floor(Math.random() * (max - min) + min);
        }
    },
    makeGrid: () => {
        /**
         * This function creates the grid - it gets the values for height and width when fired. 
         */
        const grid_height = pixlr.grid.get_height(); // gets the current value for height
        const grid_width = pixlr.grid.get_width(); // gets the current value for width 

        pixlr.grid.clear(); // clears the grid 

        if (grid_height <= 20 && grid_width <= 20) { // this limits the grid height/width to 20
            for (let x = 0; x < grid_height; x++) { // loop for rows 
                const row = pixlr.grid.element.insertRow(x); // insert a new row
                row.setAttribute('data-row', x); // set an attribute to identify the row 
                for (let y = 0; y < grid_width; y++) { // loop for cells 
                    const cell = row.insertCell(y); // insert a new cell
                    cell.setAttribute('data-column', y); // add an attribute to this current cell to identify it in the row

                    /**
                     * Add event listener for THIS cell for when mousedown 
                     */
                    cell.addEventListener('mousedown', (e) => { // on mouse down event listener
                        if (e.which === 1) { // check if left button
                            pixlr.grid.update(cell); // if left button, update the color of this cell 
                        } else if (e.which === 3) { // check if right button 
                            pixlr.grid.erase(cell); // if right button, erase color of this cell 
                        }
                    });

                    /**
                     * Add event listener for THIS cell for when mouseover
                     */
                    cell.addEventListener('mouseover', () => { // on mouse over event listener 
                        if (pixlr.status.isMouseDown) { // check the status of mouse button - check init()
                            pixlr.grid.update(cell); // update the color of this cell 
                            // output message for user letting them know you're on this cell 
                            pixlr.message.log('Brush over: ' + row.getAttribute('data-row') + ', ' + cell.getAttribute('data-column'));
                        } else if (pixlr.status.isEraserDown) { // check if the erase button is being pressed - check init() 
                            pixlr.grid.erase(cell); // erase the current cell's color 
                            // output message for user letting them know you're on this cell 
                            pixlr.message.log('Eraser over: ' + row.getAttribute('data-row') + ', ' + cell.getAttribute('data-column'));
                        } else {
                            // if no button is pressed while on canvas - let user know brush is ready. 
                            pixlr.message.log('Brush is ready.');
                        }
                    });
                }
            }
            // after grid has been made, let user know that the new grid is ready 
            pixlr.message.log('New grid ready.', 1);
        } else {
            // if user tries to make a grid with height/width that exceeds our limit, let them know they can't do that. 
            pixlr.message.log('Max width/height is 20.', 3);
        }

    },
    init: () => {

        // on mouse down, set the isMouseDown status to true  
        pixlr.grid.element.onmousedown = (e) => {
            if (e.which === 1) { // check if left button 
                e.preventDefault(); // prevent default behavior 
                pixlr.status.isMouseDown = true; // set the status to true 
            } else if (e.which === 3) { // if right button 
                e.preventDefault(); // prevent default behavior 
                pixlr.status.isEraserDown = true; // set the status to true 
            }
        };

        // on mouse up, set the isMouseDown status to false 
        pixlr.grid.element.onmouseup = (e) => {
            if (e.which === 1) { // check if left button 
                e.preventDefault(); // prevent default behavior 
                pixlr.status.isMouseDown = false; // set status to false  
            } else if (e.which === 3) { // check if right mouse button 
                e.preventDefault(); // prevent default behavior 
                pixlr.status.isEraserDown = false; // set status to false 
            }
        };

        pixlr.grid.element.onmouseleave = () => { // when user's mouse leaves the grid element area 
            pixlr.status.isMouseDown = false; // set isMouseDown to false 
            pixlr.status.isEraserDown = false; // set isEraserDown to false 
            pixlr.message.log('Brush has left canvas.', 2); // log message so user knows they're not on canvas any longer 
        };

        // prevent contextmenu from opening on right mouse click
        pixlr.grid.element.oncontextmenu = () => {
            return false;
        };

        // when color picker color changes, update the slider 
        pixlr.colors.picker.onchange = () => {
            const picker = pixlr.colors.hex(pixlr.colors.picker.value, 'hex'); // convert color picker value from hex -> rgb 
            pixlr.colors.slider.red.value = picker.r;
            pixlr.colors.slider.green.value = picker.g;
            pixlr.colors.slider.blue.value = picker.b;
            pixlr.message.log(pixlr.message.collection.picker[pixlr.util.rand(0, 3)]); // log message for user 
        };

    }
};

pixlr.makeGrid(); // create grid 
pixlr.init(); // pixlr initialization