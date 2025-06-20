import json
from dataclasses import dataclass, field
from pathlib import Path

@dataclass
class MVP:
    id: int
    name: str
    map: str
    respawn_min: int
    img: str = ""
    mapImg: str = ""
    remaining: int = field(default=0)

def load_mvp_list():
    path = Path(__file__).with_name("mvpData.json")
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = []
    mvps = []
    for idx, item in enumerate(data, 1):
        respawn_min = item.get("respawn", 0) // 60
        mvps.append(
            MVP(
                id=idx,
                name=item.get("name", f"MVP{idx}"),
                map=item.get("map", ""),
                respawn_min=respawn_min,
                img=item.get("img", ""),
                mapImg=item.get("mapImg", ""),
            )
        )
    return mvps
