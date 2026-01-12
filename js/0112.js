
/* ===========================
 *  0112.js  (jQuery 필요)
 *  RPG 캐릭터 데이터/기능 구현
 *  - 데이터: name, cls, sx, hp, mp, str, int, dex, lux, birthDate
 *  - 기능:
 *    - print~~()  : 캐릭터 단건 출력 (콘솔/문자열)
 *    - 목록출력   : <tag class="charList"/> 내부에 렌더링
 *    - insert~~() : 추가
 *    - update~~() : 수정
 *    - delete~~() : 삭제
 *    - A.attackStr(B) : A의 STR만큼 B의 HP 감소
 *    - A.attackInt(B) : A의 INT만큼 B의 HP 감소 + A의 MP 10 감소(부족시 실패)
 * =========================== */

$(function () {
  /* ---------- 상수/유틸 ---------- */
  const CLASS_LABEL = { W: '전사', M: '마법사', R: '궁수', S: '도적' };
  const SEX_LABEL = { male: '남자', female: '여자' };

  // 주스탯 선택(S/I/D/L)에 따른 기본 스탯 계산 로직
  // - 모든 스탯 기본값 10, 주스탯만 +10
  function makeStats(mainKey) {
    const base = 10, bonus = 10;
    return {
      str: base + (mainKey === 'S' ? bonus : 0),
      int: base + (mainKey === 'I' ? bonus : 0),
      dex: base + (mainKey === 'D' ? bonus : 0),
      lux: base + (mainKey === 'L' ? bonus : 0),
    };
  }

  // 숫자 파싱 helper
  function toInt(val, def = 0) {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : def;
  }

  // 값 안전 clamp
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /* ---------- 클래스 ---------- */
  class Character {
    constructor({
      id = 0, name, cls, sx, hp, mp, mainKey, birthDate,
      str, int, dex, lux
    }) {
      this.id = id;
      this.name = name;           // 문자열
      this.cls = cls;             // 'W' | 'M' | 'R' | 'S'
      this.sx = sx;               // 'male' | 'female'
      this.hp = clamp(toInt(hp), 0, 999999);
      this.mp = clamp(toInt(mp), 0, 999999);
      this.birthDate = birthDate; // YYYY-MM-DD
      this.mainKey = mainKey;     // 'S' | 'I' | 'D' | 'L'
      // 스탯: 폼에서 주스탯만 고르는 구조이므로 자동 계산(혹은 전달값 사용)
      if ([str, int, dex, lux].every(v => typeof v === 'number')) {
        this.str = str; this.int = int; this.dex = dex; this.lux = lux;
      } else {
        const stats = makeStats(mainKey);
        this.str = stats.str;
        this.int = stats.int;
        this.dex = stats.dex;
        this.lux = stats.lux;
      }
    }

    // 캐릭터 단건 출력(print~~): 문자열 반환 + 콘솔 출력
    print() {
      const out =
        `[캐릭터]
- ID: ${this.id}
- 이름: ${this.name}
- 클래스: ${CLASS_LABEL[this.cls] ?? this.cls}
- 성별: ${SEX_LABEL[this.sx] ?? this.sx}
- HP/MP: ${this.hp} / ${this.mp}
- STR/INT/DEX/LUX: ${this.str} / ${this.int} / ${this.dex} / ${this.lux}
- 생성일: ${this.birthDate}
- 주스탯: ${this.mainKey}`;
      console.log(out);
      return out;
    }

    // STR 공격: A.attackStr(B)
    attackStr(target) {
      const damage = Math.max(0, toInt(this.str));
      target.hp = clamp(target.hp - damage, 0, 999999);
      return { damage, mpCost: 0, targetHp: target.hp };
    }

    // INT 공격: A.attackInt(B) + MP 10 소모
    attackInt(target) {
      const mpCost = 10;
      if (this.mp < mpCost) {
        return { ok: false, reason: 'MP 부족', damage: 0, mpCost, targetHp: target.hp };
      }
      const damage = Math.max(0, toInt(this.int));
      target.hp = clamp(target.hp - damage, 0, 999999);
      this.mp = clamp(this.mp - mpCost, 0, 999999);
      return { ok: true, damage, mpCost, targetHp: target.hp };
    }
  }

  /* ---------- 스토어 ---------- */
  const store = {
    list: [],
    nextId: 1,
    findById(id) {
      return this.list.find(c => c.id === id) || null;
    },
    insert(model) {
      const char = new Character({ ...model, id: this.nextId++ });
      this.list.push(char);
      return char;
    },
    update(id, patch) {
      const c = this.findById(id);
      if (!c) return null;
      Object.assign(c, patch);
      // 주스탯 변경 시 자동 재계산
      if (patch.mainKey) {
        const st = makeStats(patch.mainKey);
        c.str = st.str; c.int = st.int; c.dex = st.dex; c.lux = st.lux;
      }
      // HP/MP 범위 보정
      c.hp = clamp(toInt(c.hp), 0, 999999);
      c.mp = clamp(toInt(c.mp), 0, 999999);
      return c;
    },
    delete(id) {
      const idx = this.list.findIndex(c => c.id === id);
      if (idx >= 0) {
        const [removed] = this.list.splice(idx, 1);
        return removed;
      }
      return null;
    }
  };

  /* ---------- DOM 참조 ---------- */
  const $id = $('#id');                 // hidden id
  const $name = $('#name');
  const $cls = $('#cls');
  const $sxMale = $('#male');
  const $sxFemale = $('#female');
  const $hp = $('#hp');
  const $mp = $('#mp');
  const $mainKey = $('#str');           // 주스탯 select(S/I/D/L) — 폼에서 id가 str로 되어 있음
  const $birthDate = $('#birthDate');
  const $listBlock = $('.listDataBlock');

  // 요청사항: 목록은 <tag class="charList"/> 에 출력
  let $charList = $listBlock.find('.charList');
  if ($charList.length === 0) {
    // 커스텀 태그 생성(요청된 정확한 태그명 사용)
    $charList = $('<tag class="charList"></tag>');
    $listBlock.append($charList);
  }

  // 선택 관리(공격용): 최대 2명 선택
  let selectedIds = []; // [공격자ID, 방어자ID]

  /* ---------- 폼/검증 ---------- */
  function getSexFromForm() {
    if ($sxMale.prop('checked')) return 'male';
    if ($sxFemale.prop('checked')) return 'female';
    return null;
  }

  function fillForm(char) {
    $id.val(char.id);
    $name.val(char.name);
    $cls.val(char.cls);
    $sxMale.prop('checked', char.sx === 'male');
    $sxFemale.prop('checked', char.sx === 'female');
    $hp.val(char.hp);
    $mp.val(char.mp);
    $mainKey.val(char.mainKey);
    $birthDate.val(char.birthDate);
  }

  function clearForm() {
    $id.val(0);
    $name.val('');
    $cls.val('W');
    $sxMale.prop('checked', false);
    $sxFemale.prop('checked', false);
    $hp.val(0);
    $mp.val(0);
    $mainKey.val('S');
    $birthDate.val('');
  }

  function validateForm(model) {
    if (!model.name || model.name.trim().length === 0) return '이름을 입력하세요.';
    if (!model.cls || !CLASS_LABEL[model.cls]) return '클래스를 선택하세요.';
    if (!model.sx || !SEX_LABEL[model.sx]) return '성별을 선택하세요.';
    if (model.hp < 0 || model.hp > 999999) return 'HP는 0~999999 범위여야 합니다.';
    if (model.mp < 0 || model.mp > 999999) return 'MP는 0~999999 범위여야 합니다.';
    if (!model.mainKey || !['S', 'I', 'D', 'L'].includes(model.mainKey)) return '주스탯을 선택하세요.';
    if (!model.birthDate) return '캐릭터 생성일을 입력하세요.';
    return null;
  }

  function readFormModel() {
    const sx = getSexFromForm();
    const model = {
      name: $name.val().trim(),
      cls: $cls.val(),
      sx,
      hp: toInt($hp.val(), 0),
      mp: toInt($mp.val(), 0),
      mainKey: $mainKey.val(),
      birthDate: $birthDate.val(),
    };
    return model;
  }

  /* ---------- 렌더링(목록) ---------- */
  function renderList() {
    // charList 내부에 전체 목록을 다시 그립니다.
    $charList.empty();

    // 헤더(가시성 향상을 위해 listTitleRow와 동일한 구조는 HTML 상단에 이미 존재)
    // 데이터 rows
    store.list.forEach((c) => {
      const $row = $('<div class="listDataRow"></div>').attr('data-id', c.id);

      // 선택 시 강조용 클래스
      if (selectedIds.includes(c.id)) {
        $row.addClass('selected');
      }

      // 각 열
      const $colName = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(c.name)
      );
      const $colCls = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(CLASS_LABEL[c.cls] ?? c.cls)
      );
      const $colSx = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(SEX_LABEL[c.sx] ?? c.sx)
      );
      const $colHp = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(c.hp)
      );
      const $colMp = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(c.mp)
      );
      const $colMain = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(c.mainKey)
      );
      const $colBirth = $('<div class="listItem"></div>').append(
        $('<div class="itemData text-wrapper"></div>').text(c.birthDate)
      );

      $row.append($colName, $colCls, $colSx, $colHp, $colMp, $colMain, $colBirth);
      $charList.append($row);

      // 행 클릭: 선택/폼 채우기
      $row.on('click', function () {
        const id = toInt($(this).attr('data-id'));
        const existing = store.findById(id);
        if (!existing) return;

        // 선택 토글(최대 2명 유지)
        if (selectedIds.includes(id)) {
          selectedIds = selectedIds.filter(x => x !== id);
          $(this).removeClass('selected');
        } else {
          if (selectedIds.length >= 2) {
            // 2명 초과 시 첫 번째 제거 후 추가
            selectedIds.shift();
            // 리스트 상의 클래스도 하나 제거
            $charList.find(`[data-id="${id}"]`).addClass('selected');
          }
          selectedIds.push(id);
          $(this).addClass('selected');
        }

        // 폼 채우기(최근 클릭한 행 기준)
        fillForm(existing);
      });

      // 행 더블클릭: 상세 print
      $row.on('dblclick', function () {
        alert(store.findById(toInt($(this).attr('data-id'))).print());
      });
    });
  }

  /* ---------- 기능(추가/수정/삭제/공격) ---------- */
  function insertChar() {
    const model = readFormModel();
    const err = validateForm(model);
    if (err) {
      alert(err);
      return;
    }
    const created = store.insert(model);
    alert(`추가 완료: ID=${created.id}, ${created.name}`);
    clearForm();
    renderList();
  }

  function updateChar() {
    const id = toInt($id.val(), 0);
    if (id <= 0) {
      alert('수정할 캐릭터를 목록에서 선택하세요.');
      return;
    }
    const model = readFormModel();
    const err = validateForm(model);
    if (err) {
      alert(err);
      return;
    }
    const updated = store.update(id, model);
    if (!updated) {
      alert('수정 실패: 캐릭터를 찾을 수 없습니다.');
      return;
    }
    alert(`수정 완료: ID=${updated.id}, ${updated.name}`);
    renderList();
  }

  function deleteChar() {
    const id = toInt($id.val(), 0);
    if (id <= 0) {
      alert('삭제할 캐릭터를 목록에서 선택하세요.');
      return;
    }
    const removed = store.delete(id);
    if (!removed) {
      alert('삭제 실패: 캐릭터를 찾을 수 없습니다.');
      return;
    }
    alert(`삭제 완료: ID=${removed.id}, ${removed.name}`);
    clearForm();
    // 선택 초기화
    selectedIds = selectedIds.filter(x => x !== id);
    renderList();
  }

  function attackStr() {
    if (selectedIds.length < 2) {
      alert('공격자와 방어자(총 2명)를 목록에서 선택하세요.\n첫 번째 선택=공격자, 두 번째 선택=방어자');
      return;
    }
    const attacker = store.findById(selectedIds[0]);
    const defender = store.findById(selectedIds[1]);
    if (!attacker || !defender) {
      alert('선택된 캐릭터를 찾을 수 없습니다.');
      return;
    }
    if (attacker.id === defender.id) {
      alert('동일 캐릭터를 공격할 수 없습니다.');
      return;
    }
    const result = attacker.attackStr(defender);
    alert(`[STR 공격]
공격자: ${attacker.name} (STR=${attacker.str})
방어자: ${defender.name}
피해: -${result.damage} HP
방어자 남은 HP: ${result.targetHp}`);
    renderList();
  }

  function attackInt() {
    if (selectedIds.length < 2) {
      alert('공격자와 방어자(총 2명)를 목록에서 선택하세요.\n첫 번째 선택=공격자, 두 번째 선택=방어자');
      return;
    }
    const attacker = store.findById(selectedIds[0]);
    const defender = store.findById(selectedIds[1]);
    if (!attacker || !defender) {
      alert('선택된 캐릭터를 찾을 수 없습니다.');
      return;
    }
    if (attacker.id === defender.id) {
      alert('동일 캐릭터를 공격할 수 없습니다.');
      return;
    }
    const outcome = attacker.attackInt(defender);
    if (outcome.ok === false) {
      alert(`INT 공격 실패: ${outcome.reason} (필요 MP=${outcome.mpCost}, 현재 MP=${attacker.mp})`);
      return;
    }
    alert(`[INT 공격]
공격자: ${attacker.name} (INT=${attacker.int}, MP 소모=${outcome.mpCost})
방어자: ${defender.name}
피해: -${outcome.damage} HP
방어자 남은 HP: ${outcome.targetHp}
공격자 남은 MP: ${attacker.mp}`);
    renderList();
  }

  // printList() 별칭 제공 (요청의 print~~에 맞춤)
  function printList() {
    renderList();
  }

  /* ---------- 이벤트 바인딩 ---------- */
  $('#btnAdd').on('click', insertChar);
  $('#btnUpt').on('click', updateChar);
  $('#btnDel').on('click', deleteChar);

  // HTML에 동일 id="btnAtt"가 2개 있어 index로 구분 처리
  const $attBtns = $('.btnAtt');
  $attBtns.eq(0).on('click', attackStr); // STR 공격
  $attBtns.eq(1).on('click', attackInt); // INT 공격

  /* ---------- 초기 렌더 ---------- */
  renderList();

  /* ---------- 디버그/예시 데이터(Optional) ----------
   * 초기 동작 확인용. 필요 없으면 주석 처리하세요.
   */
  const demo = [
    { name: '아르민', cls: 'W', sx: 'male',   hp: 120, mp: 30,  mainKey: 'S', birthDate: '2026-01-12' },
    { name: '미카',   cls: 'M', sx: 'female', hp: 80,  mp: 100, mainKey: 'I', birthDate: '2026-01-12' },
    { name: '라일라', cls: 'R', sx: 'female', hp: 90,  mp: 50,  mainKey: 'D', birthDate: '2026-01-12' },
  ];
  demo.forEach(m => store.insert(m));
  renderList();

  // 한 번 출력(print) 확인
  store.list.forEach(c => c.print());

  /* ---------- 전역에 필요한 함수 노출(선택) ----------
   * 외부에서 호출할 수 있도록 window에 바인딩
   */
  window.printList = printList;
  window.insertChar = insertChar;
  window.updateChar = updateChar;
  window.deleteChar = deleteChar;
});
``
