import random
import time

# 基本遊戲資料
class Game:
    def __init__(self):
        self.resources = {'minerals': 0, 'alien_artefacts': 0, 'energy': 100}
        self.items = []  # 收集的異星物品
        self.station_level = 1
        self.funds = 0

    def collect_resources(self):
        # 模擬資源收集
        mineral_collected = random.randint(5, 20)
        artefact_collected = random.randint(0, 5)
        energy_used = random.randint(5, 15)

        self.resources['minerals'] += mineral_collected
        self.resources['alien_artefacts'] += artefact_collected
        self.resources['energy'] -= energy_used

        self.funds += mineral_collected * 2  # 資源換取金錢

        print(f"收集到 {mineral_collected} 個礦物、{artefact_collected} 件異星物品，消耗 {energy_used} 單位能源。")
        print(f"剩餘能源: {self.resources['energy']} | 可用資金: {self.funds}")
    
    def upgrade_station(self):
        # 升級太空站
        if self.resources['minerals'] >= 50 and self.resources['alien_artefacts'] >= 10:
            self.resources['minerals'] -= 50
            self.resources['alien_artefacts'] -= 10
            self.station_level += 1
            print(f"太空站升級成功，當前太空站等級：{self.station_level}")
        else:
            print("資源不足，無法升級太空站！")
    
    def random_event(self):
        # 隨機事件
        event = random.choice(["storm", "alien_attack", "none"])
        if event == "storm":
            storm_damage = random.randint(10, 30)
            self.resources['energy'] -= storm_damage
            print(f"警告：太空風暴來襲！能源損失 {storm_damage} 單位！")
        elif event == "alien_attack":
            attack_damage = random.randint(20, 50)
            self.resources['minerals'] -= attack_damage
            print(f"警告：外星生物襲擊！礦物損失 {attack_damage} 單位！")
        else:
            print("今天是平靜的一天。")
    
    def show_status(self):
        # 顯示當前狀態
        print(f"\n當前太空站等級: {self.station_level}")
        print(f"礦物: {self.resources['minerals']} | 異星物品: {self.resources['alien_artefacts']} | 能源: {self.resources['energy']}")
        print(f"可用資金: {self.funds}")
    
    def play_turn(self):
        # 進行一回合的遊戲
        self.collect_resources()
        self.random_event()
        self.show_status()

# 遊戲開始
def start_game():
    print("歡迎來到星際資源大亨！")
    game = Game()

    while game.resources['energy'] > 0 and game.funds < 1000:  # 當資源足夠且金錢未達目標
        game.play_turn()
        
        # 玩家選擇
        action = input("\n選擇行動:\n1. 升級太空站\n2. 休息並恢復能源\n3. 結束遊戲\n請輸入選項: ")

        if action == '1':
            game.upgrade_station()
        elif action == '2':
            game.resources['energy'] = 100  # 恢復能源
            print("能源已恢復！")
        elif action == '3':
            print("結束遊戲。感謝遊玩！")
            break
        else:
            print("無效選項，請重新選擇。")

        time.sleep(1)  # 等待一秒以便觀察結果

if __name__ == "__main__":
    start_game()
