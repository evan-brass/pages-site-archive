
struct Color {
    red: u8,
    green: u8,
    blue: u8,
    opacity: u8
}
impl Color {
    fn distance(&self, other: &Color) -> u32 {
        ((self.red as i8 - other.red as i8).abs() +
        (self.green as i8 - other.green as i8).abs() +
        (self.blue as i8 - other.blue as i8).abs()) as u32
    }
    fn copy(&mut self, other: &Color) {
        self.red = other.red;
        self.green = other.green;
        self.blue = other.blue;
        self.opacity = 255;
    }
}

struct ColorIterator {
    count: u32,
    pointer: *mut Color
}
impl Iterator for ColorIterator {
    type Item = &'static mut Color;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count > 0 {
            self.count -= 1;
            unsafe {
                let ret_val = &mut *self.pointer;
                self.pointer = self.pointer.offset(1);
                Some(ret_val)
            }
        } else {
            None
        }
    }
}

fn pixels(width: u32, height: u32, palette_size: u32) -> ColorIterator {
    ColorIterator {
        count: width * height,
        pointer: (3 * palette_size + 1) as *mut Color
    }
}

/*
fn palette(palette_size: u32) -> ColorIterator {
    ColorIterator {
        count: palette_size,
        pointer: 0 as *mut Color
    }
}
*/

#[no_mangle]
pub fn filter(width: u32, height: u32, palette_size: u32) {
    for pixel in pixels(width, height, palette_size) {
        let mut smallest_distance = u32::max_value();
        let mut closest_palette: &Color = unsafe {
            &*(0 as *const Color)
        };
        for index in 0..palette_size {
            let color = unsafe {
                &*((index * 3) as *const Color)
            };
            let diff = pixel.distance(color);
            if diff < smallest_distance {
                smallest_distance = diff;
                closest_palette = color;
            };
        }
        pixel.copy(closest_palette);
    }
}