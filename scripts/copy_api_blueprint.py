#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
api-blueprint 디렉토리를 순회하며 모든 *.js 파일을 복사합니다.

규칙:
1) 기본 규칙
   SRC: api-blueprint/n1/n2/.../nm/[srcname].js
   DST: api/n1/n2/.../nm/[srcname]/route.js   (파일 내용 그대로 복사)

2) 예외 규칙 (언더스코어 디렉토리 보존)
   경로 내에 '_' 로 시작하는 디렉토리(예: _utils, _lib, _any)가 하나라도 포함되어 있으면
   해당 파일은 구조와 이름을 **그대로** 복사합니다.
   SRC: api-blueprint/_lib/tools.js  →  DST: api/_lib/tools.js
   SRC: api-blueprint/users/_shared/x.js → DST: api/users/_shared/x.js

사용법:
  python copy_api_blueprint.py
옵션:
  --src DIR           (기본: api-blueprint)
  --dst DIR           (기본: api)
  --skip-existing     (기존 파일이 있으면 덮어쓰지 않음)
  --dry-run           (실제로 쓰지 않고 어떤 파일이 써질지 출력만)
  --verbose           (진행 로그 자세히)
"""

from pathlib import Path
import argparse
import sys

def copy_js_files(src_root: Path, dst_root: Path, skip_existing: bool, dry_run: bool, verbose: bool) -> int:
    if not src_root.exists() or not src_root.is_dir():
        print(f"[에러] 소스 디렉토리를 찾을 수 없습니다: {src_root}", file=sys.stderr)
        return 1

    created = 0
    total = 0

    for src_file in src_root.rglob("*.js"):
        if not src_file.is_file():
            continue

        # api-blueprint 하위에서의 상대 경로
        rel_path = src_file.relative_to(src_root)          # n1/n2/.../nm/[srcname].js
        rel_parent = rel_path.parent                       # n1/n2/.../nm
        srcname = src_file.stem                            # [srcname]
        srcfilename = src_file.name                        # [srcname].js

        # 예외 규칙: 경로 중 하나라도 '_' 로 시작하는 디렉토리가 있으면 "그대로 복사"
        has_underscore_dir = any(part.startswith("_") for part in rel_parent.parts)

        if has_underscore_dir:
            # DST: api/n1/n2/.../nm/[srcname].js  (그대로)
            dst_dir = dst_root / rel_parent
            dst_file = dst_dir / srcfilename
        else:
            # 기본 규칙: DST: api/n1/n2/.../nm/[srcname]/route.js
            dst_dir = dst_root / rel_parent / srcname
            dst_file = dst_dir / "route.js"

        total += 1

        if skip_existing and dst_file.exists():
            if verbose:
                print(f"[SKIP] 이미 존재: {dst_file}")
            continue

        if verbose or dry_run:
            mode = "COPY-SAME " if has_underscore_dir else "MAP       "
            print(f"[{mode}] {src_file}  ->  {dst_file}")

        if dry_run:
            continue

        try:
            dst_dir.mkdir(parents=True, exist_ok=True)
            content = src_file.read_text(encoding="utf-8")
            dst_file.write_text(content, encoding="utf-8")
            created += 1
        except Exception as e:
            print(f"[에러] 복사 실패: {src_file} -> {dst_file}\n       {e}", file=sys.stderr)

    print(f"\n완료: 대상 파일 {total}개 중 {created}개 생성/갱신")
    if skip_existing:
        print("(기존 파일은 건너뜀)")
    if dry_run:
        print("(dry-run: 실제 파일 쓰기 없음)")

    return 0


def main():
    parser = argparse.ArgumentParser(description="api-blueprint/*.js → api/.../[srcname]/route.js 복사기 (언더스코어 디렉토리는 그대로)")
    parser.add_argument("--src", default="api-blueprint", help="소스 루트 디렉토리 (기본: api-blueprint)")
    parser.add_argument("--dst", default="api", help="목적지 루트 디렉토리 (기본: api)")
    parser.add_argument("--skip-existing", action="store_true", help="이미 있는 대상 파일은 건너뜀")
    parser.add_argument("--dry-run", action="store_true", help="실제로 쓰지 않고 매핑만 출력")
    parser.add_argument("--verbose", action="store_true", help="진행 로그 자세히 출력")
    args = parser.parse_args()

    src_root = Path(args.src).resolve()
    dst_root = Path(args.dst).resolve()

    if args.verbose:
        print(f"[INFO] SRC: {src_root}")
        print(f"[INFO] DST: {dst_root}")
        print(f"[INFO] 옵션: skip_existing={args.skip_existing}, dry_run={args.dry_run}")

    code = copy_js_files(
        src_root=src_root,
        dst_root=dst_root,
        skip_existing=args.skip_existing,
        dry_run=args.dry_run,
        verbose=args.verbose
    )
    sys.exit(code)


if __name__ == "__main__":
    main()
