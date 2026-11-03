# Third-party licenses (서드파티 라이선스)

이 프로젝트에 포함된 외부 저작물의 라이선스를 정리한 파일입니다.
앱 안의 "출처·라이선스 보기" 버튼에서도 같은 내용을 볼 수 있습니다.

## 장기 3D 모형 — HuBMAP Human Reference Atlas (HRA) 3D Reference Object Library

- 게시자(Publisher): HuBMAP Consortium, Indiana University
- 라이선스: **Creative Commons Attribution 4.0 International (CC BY 4.0)**
- 라이선스 전문: https://creativecommons.org/licenses/by/4.0/
- 라이브러리 안내: https://humanatlas.io/3d-reference-library
- 원본 데이터: Visible Human Project, U.S. National Library of Medicine
  (뇌 모형은 Allen Human Reference Atlas, Ding et al. 2016 기반)
- 인용: Kristen Browne, Heidi Schlehlein, Bruce W. Herr II, Ellen Quardokus,
  Andreas Bueckle, Katy Börner. HuBMAP CCF 3D Reference Object Library.
- 변경 사항: 교육용으로 크기 조정·회전 없는 배치·단일 색상 재도색
  (Resized, placed without rotation, recolored with single educational colors).

개별 모형 14종 (public/models/):

| 파일 | HRA 오브젝트 | 버전 | 제작자 | 출처 |
|---|---|---|---|---|
| bladder.glb | Urinary Bladder, Male | v1.2 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/urinary-bladder-male |
| bronchus.glb | Main Bronchus, Male | v1.1 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/main-bronchus-male |
| ureter-r.glb | Ureter (Right), Male | v1.2 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/ureter-male-right |
| ureter-l.glb | Ureter (Left), Male | v1.2 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/ureter-male-left |
| large-intestine.glb | Large Intestine, Male | v1.3 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/large-intestine-male |
| small-intestine.glb | Small Intestine, Male | v1.2 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/small-intestine-male |
| liver.glb | Liver, Male | v1.2 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/liver-male |
| trachea.glb | Trachea, Male | v1.1 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/trachea-male |
| kidney-l.glb | Kidney (Left), Male | v1.3 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/kidney-male-left |
| kidney-r.glb | Kidney (Right), Male | v1.3 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/kidney-male-right |
| pancreas.glb | Pancreas, Male | v1.3 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/pancreas-male |
| heart.glb | Heart, Male | v1.3 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/heart-male |
| lung.glb | Lung, Male | v1.4 | Kristen Browne, Heidi Schlehlein | https://purl.humanatlas.io/ref-organ/lung-male |
| brain.glb | Brain, Male | v1.4 | Kristen Browne, Heidi Schlehlein (Allen 기반) | https://purl.humanatlas.io/ref-organ/brain-male |

CC BY 4.0에 따라 위 저작자를 표시하고, 라이선스 링크와 변경 사항을 알립니다.
입·식도·위·쓸개·피부·근육·골격·혈관·신경 모형은 이 프로젝트의 자체 제작물입니다.

## 라이브러리 (npm 의존성)

- three (MIT), vite / vitest / playwright 등 개발 도구는 각 패키지의 라이선스를 따릅니다.
