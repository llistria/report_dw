/*
RPG게임 캐릭터 데이터
이름, 직업(전사,마법사,궁수,도적), 성별(남자,여자), HP, MP, STR, INT, DEX, LUX, 생일
name, cls, sx, hp, mp, str, int, dex, lux, birthDate

RPG게임 캐릭터 기능
출력 print~~()하는 기능, 목록출력은 <태그 class="charList"/>

추가 insert~~(), 수정 update~~(), 삭제 delete~~() 기능
공격기능 A.attackStr(B); A캐릭터 B캐릭터 STR을 이용하여 공격하면 B캐릭터는 HP가 감소한다.
마법공격 A.attackInt(B); A캐릭터 B캐릭터 INT을 이용하여 공격하면 B캐릭터는 HP가 감소한다. A캐릭터는 MP가 감소한다.
*/

if ( mode === "add" && $("#id").val() != 0 ) {
      alert("ID 값이 유효하지 않습니다.");
      return false;
    } else  if ( mode === "update" || mode === "delete" ) {
      if ( $("#id").val() == 0 ) {
        alert("ID 값이 유효하지 않습니다.");
        return false;
      } else {
        return true;
      }
    }
    if ($("#name").val().length < 2 || $("#name").val().length > 30) {
      alert("이름은 2자~12자까지 입력 가능 합니다.");
      $("#name").focus();
      return false;
    }
    if (
      $("#price").val().length < 1 ||
      $("#price").val() * 1 <= 0 ||
      $("#price").val() * 1 > 12
    ) {
      alert(".");
      $("#price").focus();
      return false;
    }
    if ($("#imgUrl").val().indexOf("http") !== 0) {
      alert("그림이미지는 http 로 시작해야 합니다.");
      $("#imgUrl").focus();
      return false;
    }
    return true;
  