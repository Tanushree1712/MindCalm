import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

os.makedirs('screenshots', exist_ok=True)

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,820')
options.add_argument('--force-device-scale-factor=1')

driver = webdriver.Chrome(options=options)
driver.get('http://localhost:3000')
time.sleep(2)

tabs = [
    ('home', 'screenshots/01_sanctuary_home.png'),
    ('companion', 'screenshots/02_ai_companion.png'),
    ('checkin', 'screenshots/03_somatic_checkin.png'),
    ('tools', 'screenshots/04_calming_tools.png'),
    ('journal', 'screenshots/05_reflective_journal.png'),
    ('trends', 'screenshots/06_trend_analytics.png'),
    ('gratitude', 'screenshots/07_community_gratitude.png'),
    ('rewards', 'screenshots/08_sanctuary_rewards.png')
]

for tab, filename in tabs:
    script = "localStorage.setItem('mindcalm_active_tab', '" + tab + "'); window.location.reload();"
    driver.execute_script(script)
    time.sleep(1.8)
    driver.save_screenshot(filename)
    print("Saved", filename)

driver.quit()
print("All screenshots successfully captured!")
