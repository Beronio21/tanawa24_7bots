use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Open Tanawa Studio", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Tanawa 24/7 Bot", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &quit])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Tanawa 24/7 Bot")
        .icon(tray_icon_image())
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => show_main_window(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn show_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        eprintln!("Could not reopen Tanawa Studio because the main window was not found.");
        return;
    };

    if let Err(error) = window.show() {
        eprintln!("Could not show the Tanawa Studio window: {error}");
        return;
    }

    if let Err(error) = window.set_focus() {
        eprintln!("Could not focus the Tanawa Studio window: {error}");
    }
}

fn tray_icon_image() -> tauri::image::Image<'static> {
    const SIZE: u32 = 32;
    let mut pixels = vec![0; (SIZE * SIZE * 4) as usize];

    for y in 2..30 {
        for x in 2..30 {
            let in_mark = (y < 10 && (7..25).contains(&x))
                || ((15..25).contains(&y) && (14..19).contains(&x));
            let color = if in_mark {
                [250, 246, 240, 255]
            } else {
                [217, 107, 67, 255]
            };
            let index = ((y * SIZE + x) * 4) as usize;
            pixels[index..index + 4].copy_from_slice(&color);
        }
    }

    tauri::image::Image::new_owned(pixels, SIZE, SIZE)
}
