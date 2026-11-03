import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Human Body Atlas/ })).toBeVisible();
});

test('all 5 layers toggle on/off', async ({ page }) => {
  for (const name of ['피부', '근육', '골격', '장기', '신경·혈관']) {
    const box = page.getByRole('checkbox', { name: new RegExp(name) });
    await expect(box).toBeVisible();
    await expect(box).toBeChecked();
    await box.uncheck();
    await expect(box).not.toBeChecked();
    await box.check();
    await expect(box).toBeChecked();
  }
});

test('isolate mode + reset', async ({ page }) => {
  const isolateButtons = page.getByRole('button', { name: '격리' });
  await expect(isolateButtons).toHaveCount(5);
  await isolateButtons.first().click();
  await expect(page.getByRole('button', { name: '격리 해제' })).toBeVisible();
  await page.getByRole('button', { name: '레이어 초기화' }).click();
  await expect(page.getByRole('button', { name: '격리 해제' })).toHaveCount(0);
});

test('organ shortcut opens the correct KR card', async ({ page }) => {
  await page.getByRole('button', { name: '심장', exact: true }).click();
  await expect(page.getByRole('heading', { name: /심장/ })).toBeVisible();
  await expect(page.getByText('펌프처럼 뛰며 피를')).toBeVisible();
  await expect(page.getByText('관련 질병')).toBeVisible();
});

test('digestion tour walks all 6 stops', async ({ page }) => {
  const stop = page.locator('.tour-stop');
  await page.getByRole('button', { name: '소화 투어 시작' }).click();
  await expect(stop).toContainText('1정거장');
  // Freeze auto-advance so stepping is deterministic.
  await page.getByRole('button', { name: '투어 정지' }).click();
  for (let n = 2; n <= 6; n += 1) {
    await page.getByRole('button', { name: '다음 정거장' }).click();
    await expect(stop).toContainText(`${n}정거장`);
  }
  await expect(page.getByText('입 → 식도 → 위 → 소장 → 대장')).toBeVisible();
});

test('label quiz opens, scores, and resets', async ({ page }) => {
  await page.getByRole('button', { name: '라벨 퀴즈 풀기' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '채점하기' }).click();
  await expect(page.getByText(/개 중 \d+개 정답/)).toBeVisible();
});

test('circulation tour tab walks its 5 stops', async ({ page }) => {
  const stop = page.locator('.tour-stop');
  await page.getByRole('tab', { name: '순환 투어' }).click();
  await expect(stop).toContainText('1정거장');
  await expect(stop).toContainText('심장');
  await page.getByRole('button', { name: '순환 투어 시작' }).click();
  await page.getByRole('button', { name: '투어 정지' }).click();
  await page.getByRole('button', { name: '다음 정거장' }).click();
  await expect(stop).toContainText('2정거장');
  await expect(stop).toContainText('폐');
});

test('breathing tour tab shows 4 dots', async ({ page }) => {
  await page.getByRole('tab', { name: '호흡 투어' }).click();
  await expect(page.locator('.tour-stop')).toContainText('숨의 길');
  await expect(page.getByRole('button', { name: '호흡 투어 시작' })).toBeVisible();
  const dots = page.locator('.tour-dots button');
  await expect(dots).toHaveCount(4);
});

test('new organ shortcut opens the bladder KR card', async ({ page }) => {
  await page.getByRole('button', { name: '방광', exact: true }).click();
  await expect(page.getByRole('heading', { name: /방광/ })).toBeVisible();
  await expect(page.getByText('오줌을 모아')).toBeVisible();
});

test('real organ models finish loading (GLB with procedural fallback)', async ({ page }) => {
  const canvas = page.locator('#scene');
  await expect(canvas).toHaveAttribute('data-models-attempted', '14', { timeout: 90000 });
  await expect(canvas).toHaveAttribute('data-models-loaded', '14', { timeout: 90000 });
  await expect(page.getByText('실제 장기 모형 14종으로 바뀌었습니다')).toBeVisible();
});

test('clicking the real heart mesh opens its card (raycast on GLB)', async ({ page }) => {
  const canvas = page.locator('#scene');
  await expect(canvas).toHaveAttribute('data-models-loaded', '14', { timeout: 90000 });
  // Focus the camera on the heart, then deselect so only a real 3D hit reopens.
  await page.getByRole('button', { name: '심장', exact: true }).click();
  await page.getByRole('button', { name: '카드 닫기' }).click();
  await page.waitForTimeout(1800);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await expect(page.getByRole('heading', { name: /심장/ })).toBeVisible();
});

test('attribution dialog shows CC BY 4.0 credit', async ({ page }) => {
  await page.getByRole('button', { name: '출처·라이선스 보기' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('CC BY 4.0').first()).toBeVisible();
  await expect(dialog.getByText('Human Reference Atlas').first()).toBeVisible();
  await expect(dialog.getByText('Heart, Male')).toBeVisible();
});

test('reduced motion is announced and tour still steps', async ({ page, context }) => {
  await context.grantPermissions([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByText(/움직임 줄이기 설정/)).toBeVisible();
  await page.getByRole('button', { name: '소화 투어 시작' }).click();
  await expect(page.locator('.tour-stop')).toContainText('1정거장');
  await page.getByRole('button', { name: '다음 정거장' }).click();
  await expect(page.locator('.tour-stop')).toContainText('2정거장');
});
