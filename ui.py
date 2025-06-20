import tkinter as tk
from tkinter import ttk, simpledialog
from pathlib import Path
from mvp import MVP, load_mvp_list


def format_time(seconds):
    m, s = divmod(max(0, seconds), 60)
    return f"{m:02d}:{s:02d}"


def open_loot_window(mvp: MVP):
    pass


class MVPApp:
    def __init__(self):
        self.mvps = load_mvp_list()
        self.images = {}
        self.root = tk.Tk()
        self.nimg = tk.PhotoImage(width=1, height=1)
        self.root.title("Ragnarok MVP Timer")
        self.root.configure(bg="#1e1e1e")
        self.paned = ttk.PanedWindow(self.root, orient="horizontal")
        self.paned.pack(fill="both", expand=True)
        self.left_frame = ttk.Frame(self.paned)
        self.mid_frame = ttk.Frame(self.paned)
        self.right_frame = ttk.Frame(self.paned)
        self.paned.add(self.left_frame, weight=1)
        self.paned.add(self.mid_frame, weight=1)
        self.paned.add(self.right_frame, weight=1)
        self.left_tree = ttk.Treeview(self.left_frame, show="tree")
        self.left_tree.pack(fill="both", expand=True)
        self.right_tree = ttk.Treeview(self.right_frame, show="tree")
        self.right_tree.pack(fill="both", expand=True)
        self.mid_img = tk.Label(self.mid_frame, bg="#1e1e1e")
        self.mid_img.pack(pady=10)
        self.mid_name = tk.Label(self.mid_frame, font=("Helvetica", 14), fg="#f0f0f0", bg="#1e1e1e")
        self.mid_name.pack()
        self.mid_time = tk.Label(self.mid_frame, fg="#f0f0f0", bg="#1e1e1e")
        self.mid_time.pack()
        self.start_btn = ttk.Button(self.root, text="Başlat", command=self.manual_start)
        self.start_btn.pack(pady=5)
        self.left_tree.bind("<Double-1>", self.on_open_loot)
        self.update_lists()
        self.tick()

    def get_image(self, mvp: MVP):
        if mvp.id in self.images:
            return self.images[mvp.id]
        path = Path(mvp.img)
        if not path.exists():
            img = self.nimg
        else:
            img = tk.PhotoImage(file=str(path))
        self.images[mvp.id] = img
        return img

    def update_lists(self):
        self.left_tree.delete(*self.left_tree.get_children())
        self.right_tree.delete(*self.right_tree.get_children())
        for m in sorted([x for x in self.mvps if x.remaining > 0], key=lambda v: v.remaining):
            self.left_tree.insert("", "end", iid=str(m.id), text=f"{m.name} {m.map} {format_time(m.remaining)}")
        for m in sorted([x for x in self.mvps if x.remaining < 0], key=lambda v: v.remaining):
            self.right_tree.insert("", "end", iid=str(m.id), text=f"{m.name} {m.map} {format_time(-m.remaining)}")
        pos = [x for x in self.mvps if x.remaining > 0]
        if pos:
            target = min(pos, key=lambda v: v.remaining)
            self.mid_name.config(text=f"{target.name} - {target.map}")
            self.mid_time.config(text=format_time(target.remaining))
            img_path = Path(target.img)
            if img_path.exists():
                img = tk.PhotoImage(file=str(img_path))
            else:
                img = self.nimg
            self.mid_img.config(image=img)
            self.mid_img.image = img
        else:
            self.mid_name.config(text="")
            self.mid_time.config(text="")
            self.mid_img.config(image=self.nimg)

    def tick(self):
        for m in self.mvps:
            if m.remaining != 0:
                if m.remaining > 0:
                    m.remaining -= 1
                else:
                    m.remaining -= 1
        self.update_lists()
        self.root.after(1000, self.tick)

    def manual_start(self):
        sel = self.left_tree.selection()
        if not sel:
            return
        idx = int(sel[0]) - 1
        mvp = self.mvps[idx]
        value = simpledialog.askstring("Süre", "dk:ss")
        if not value:
            return
        try:
            mm, ss = value.split(":")
            total = int(mm) * 60 + int(ss)
            mvp.remaining = total
        except Exception:
            pass
        self.update_lists()

    def on_open_loot(self, event):
        sel = self.left_tree.selection()
        if sel:
            mvp = self.mvps[int(sel[0]) - 1]
            open_loot_window(mvp)

    def run(self):
        self.root.mainloop()

