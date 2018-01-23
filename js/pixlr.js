let pixlr = {
    grid: {
        element: document.getElementById('pixel_canvas'),
        background: {
            element: document.getElementById('canvas_bg'),
            change: () => {
                pixlr.grid.element.style.backgroundColor = pixlr.grid.background.element.value;
                pixlr.message.log('Background color changed to ' + pixlr.grid.background.element.value, 2);
            }
        },
        get_height: () => {
            return document.getElementById('input_height').value;
        },
        get_width: () => {
            return document.getElementById('input_width').value;
        },
        clear: () => {
            pixlr.grid.element.innerHTML = '';
            pixlr.message.log('Grid has been cleared.', 1);
        },
        erase: (cell) => {
            cell.style.backgroundColor = 'transparent'; // clear color from cell
        },
        update: (cell) => {
            const color = document.getElementById('color_picker').value;  // get color from color picker
            cell.style.backgroundColor = color; // update cell clicked
            pixlr.colors.record(color);
            pixlr.colors.update();
        },
        transparent: () => {
            pixlr.grid.element.style.backgroundColor = 'transparent';
            pixlr.message.log('Grid background is now transparent.');
        },
        borders: {
            toggle: (status) => {
                let elements = document.querySelectorAll('#pixel_canvas *'),
                    count = elements.length;
                while (count--) {
                    elements[count].style.border = (status === undefined) ? 'none' : '1px solid #d1d1d1';
                }
            }
        }
    },
    pixels: {
        element: document.getElementById('saved_pixel'),
        save: () => {
            pixlr.grid.borders.toggle();
            html2canvas(pixlr.grid.element, {
                backgroundColor: null
            }).then((canvas) => {
                // todo: add event listener here to open a bigger version of it
                pixlr.pixels.element.appendChild(canvas);
                pixlr.grid.borders.toggle(true);
                pixlr.message.log('New pixel has been saved. Check preview!', 1);
            });
        }
    },
    message: {
        collection: {
            colors: ['Selecting this color again?', 'Oldie, but a goodie!', 'This color choice is still awesome!', 'Definitely one of your favorite colors.'],
            picker: ['Awesome new color!', 'Bit on the wild side, no?', 'Adventurous color choice!', 'It\'s a bit... meh?']
        },
        element: document.getElementById('pixlr_console'),
        log: (message, type) => {
            let element = pixlr.message.element;
            type === 1 ? element.className = 'success-message' :
                type === 2 ? element.className = 'warning-message' :
                    type === 3 ? element.className = 'error-message' :
                        element.className = 'normal-message';
            pixlr.message.element.innerText = message;
        }
    },
    status: {
        isMouseDown: false,
        isEraserDown: false
    },
    colors: {
        element: document.querySelector('#color_history tr'),
        picker: document.getElementById('color_picker'),
        history: [],
        clear: () => {
            pixlr.colors.element.innerHTML = "";
        },
        update: () => {
            const history = pixlr.colors.element; // color history row
            pixlr.colors.clear();

            // loop over current colors
            for (let i = 0; i < pixlr.colors.history.length; i += 1) {
                let color_cell = history.insertCell(0); //add cell for current color
                color_cell.style.backgroundColor = pixlr.colors.history[i][0]; //fill in with current color

                color_cell.addEventListener('click', () => {
                    const brush_color = document.getElementById('color_picker').value;
                    console.log(brush_color + ' : ' + color_cell.style.backgroundColor);
                    if (brush_color !== color_cell.style.backgroundColor) {
                        document.getElementById('color_picker').value = pixlr.colors.history[i][0]; //use color when clicked
                        pixlr.message.log(pixlr.message.collection.colors[pixlr.util.rand(0, 3)], 1);
                    } else {
                        pixlr.message.log('You\'re already using that color!', 3);
                    }

                });
            }
        },
        sort: () => {
            pixlr.colors.history.sort((a, b) => {
                return a[1] - b[1];
            })
        },
        record: (color) => {
            let isNew = false,
                l = pixlr.colors.history.length;

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

            pixlr.colors.sort();
        },
        slider:  {
            red: document.getElementById('pixlr_red'),
            blue: document.getElementById('pixlr_blue'),
            green: document.getElementById('pixlr_green'),
            update: () => {
                console.log('rgb(' + pixlr.colors.slider.red.value + ', ' + pixlr.colors.slider.green.value + ', ' + pixlr.colors.slider.blue.value + ')');
                pixlr.colors.picker.value = pixlr.colors.convert('rgb(' + pixlr.colors.slider.red.value + ', ' + pixlr.colors.slider.green.value + ', ' + pixlr.colors.slider.blue.value + ')', 'rgb');
            }
        },
        rgb: (color) => {
            color = color.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (color && color.length === 4) ? "#" +
                ("0" + parseInt(color[1],10).toString(16)).slice(-2) +
                ("0" + parseInt(color[2],10).toString(16)).slice(-2) +
                ("0" + parseInt(color[3],10).toString(16)).slice(-2) : '';
        },
        hex: (hex) => {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        convert: (color, type) => {
            return type === 'rgb' ? pixlr.colors.rgb(color) : pixlr.colors.hex(color);
        }
    },
    util: {
        rand: (min, max) => {
            return Math.floor(Math.random() * (max - min) + min);
        }
    },
    makeGrid: () => {
        const grid_height = pixlr.grid.get_height();
        const grid_width = pixlr.grid.get_width();

        pixlr.grid.clear();

        if (grid_height <= 20 && grid_width <= 20) {
            for (let x = 0; x < grid_height; x++) {
                const row = pixlr.grid.element.insertRow(x);
                row.setAttribute('data-row', x);
                for (let y = 0; y < grid_width; y++) {
                    const cell = row.insertCell(y);
                    cell.setAttribute('data-column', y);
                    cell.addEventListener('mousedown', (e) => {
                        if (e.which === 1) { // if left button
                            pixlr.grid.update(cell); //
                        } else if (e.which === 3) {
                            pixlr.grid.erase(cell);
                        }
                    });

                    cell.addEventListener('mouseover', () => {
                        if (pixlr.status.isMouseDown) {
                            pixlr.grid.update(cell);
                            pixlr.message.log('Brush over: ' + row.getAttribute('data-row') + ', ' + cell.getAttribute('data-column'));
                        }
                        else if (pixlr.status.isEraserDown) {
                            pixlr.grid.erase(cell);
                            pixlr.message.log('Eraser over: ' + row.getAttribute('data-row') + ', ' + cell.getAttribute('data-column'));
                        }
                        else {
                            pixlr.message.log('Brush is ready.');
                        }
                    });
                }
            }
            pixlr.message.log('New grid ready.', 1);
        } else {
            pixlr.message.log('Max width/height is 20.', 3);
        }

    },
    init: () => {
        // keep track if user has their mouse button pressed & within the canvas
        // applies to left mouse button
        pixlr.grid.element.onmousedown = (e) => {
            if (e.which === 1) {
                e.preventDefault();
                pixlr.status.isMouseDown = true;
            }
            else if (e.which === 3) {
                e.preventDefault();
                pixlr.status.isEraserDown = true;
            }
        };
        pixlr.grid.element.onmouseup = (e) => {
            if (e.which === 1) {
                e.preventDefault();
                pixlr.status.isMouseDown = false;
            }
            else if (e.which === 3) {
                e.preventDefault();
                pixlr.status.isEraserDown = false;
            }
        };
        pixlr.grid.element.onmouseleave = () => {
            pixlr.status.isMouseDown = false;
            pixlr.status.isEraserDown = false;
            pixlr.message.log('Brush has left canvas.', 2);
        };
        pixlr.grid.element.oncontextmenu = () => {
            return false;
        };
        pixlr.colors.picker.onchange = () => {
            const picker = pixlr.colors.hex(pixlr.colors.picker.value, 'hex');
            pixlr.colors.slider.red.value = picker.r;
            pixlr.colors.slider.green.value = picker.g;
            pixlr.colors.slider.blue.value = picker.b;
            pixlr.message.log(pixlr.message.collection.picker[pixlr.util.rand(0, 3)]);
        };

    }
};

pixlr.init();