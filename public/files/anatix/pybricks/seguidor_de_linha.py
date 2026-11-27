"""
Exemplo Anatix — seguidor de linha com PID e desvio de obstáculo

Mesmo exemplo da versão Arduino, agora com peças LEGO e Pybricks:
  * 2 sensores de cor (portas C e D) olhando a linha
  * 1 sensor ultrassônico (porta E)
  * motores nas portas A (esquerdo) e B (direito)

Ajuste portas, diâmetro da roda e distância entre rodas para o seu robô.
Para a versão de competição, troque enabled=True por enabled=False.
"""
from pybricks.hubs import PrimeHub
from pybricks.parameters import Port, Direction
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor
from pybricks.robotics import DriveBase

from anatix import anx

hub = PrimeHub()
motor_esq = Motor(Port.A, Direction.COUNTERCLOCKWISE)
motor_dir = Motor(Port.B)
sensor_esq = ColorSensor(Port.C)
sensor_dir = ColorSensor(Port.D)
ultrassom = UltrasonicSensor(Port.E)
robo = DriveBase(motor_esq, motor_dir, wheel_diameter=56, axle_track=112)

anx.begin("Seguidor-OBR", hub, enabled=True)

KP, KI, KD = 1.2, 0.0, 6.0
VELOCIDADE_BASE = 150  # mm/s
erro_anterior = 0
integral = 0
avisou_obstaculo = False

while True:
    anx.update()  # sempre no início do loop

    # --- Sensores ---------------------------------------------------------
    with anx.scope("leitura_cor"):
        esq = sensor_esq.reflection()
        dir = sensor_dir.reflection()
    anx.value("sensor_esq", esq)
    anx.value("sensor_dir", dir)

    with anx.scope("ultrassom"):
        distancia = ultrassom.distance()  # mm
    anx.value("distancia_mm", distancia)

    # --- Decisão ----------------------------------------------------------
    if distancia < 100:
        anx.state("modo", "desviando")
        if not avisou_obstaculo:
            anx.event("obstaculo", distancia)
            avisou_obstaculo = True
        robo.stop()
        continue
    avisou_obstaculo = False
    anx.state("modo", "seguindo_linha")

    # --- PID --------------------------------------------------------------
    with anx.scope("pid"):
        erro = esq - dir
        integral += erro
        derivada = erro - erro_anterior
        erro_anterior = erro
        correcao = KP * erro + KI * integral + KD * derivada

    anx.value("pid_erro", erro)
    anx.value("pid_correcao", correcao)

    robo.drive(VELOCIDADE_BASE, correcao)
    anx.value("motor_esq_graus_s", motor_esq.speed(), every=100)
    anx.value("motor_dir_graus_s", motor_dir.speed(), every=100)

    if abs(esq - dir) > 70:
        anx.event("linha_perdida")
