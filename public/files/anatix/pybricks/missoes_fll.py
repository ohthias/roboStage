"""
Exemplo Anatix — missões sem loop (estilo FLL) com multitarefa

Programas do tipo "anda 500 mm, gira 90°, levanta o braço" não têm um
loop onde chamar anx.update(). A solução é rodar anx.keep_alive() em
paralelo, com multitask() do Pybricks. Os movimentos usam `await`.
"""
from pybricks.hubs import PrimeHub
from pybricks.parameters import Port, Direction
from pybricks.pupdevices import Motor
from pybricks.robotics import DriveBase
from pybricks.tools import multitask, run_task, wait, StopWatch

from anatix import anx

hub = PrimeHub()
motor_esq = Motor(Port.A, Direction.COUNTERCLOCKWISE)
motor_dir = Motor(Port.B)
braco = Motor(Port.C)
robo = DriveBase(motor_esq, motor_dir, wheel_diameter=56, axle_track=112)
robo.use_gyro(True)

anx.begin("Robo-FLL", hub)


async def missao_1():
    anx.state("missao", "m1_ida")
    with anx.scope("m1_reta"):
        await robo.straight(500)
    with anx.scope("m1_giro"):
        await robo.turn(90)
    anx.value("m1_angulo_final", hub.imu.heading())

    anx.state("missao", "m1_braco")
    with anx.scope("m1_braco"):
        await braco.run_angle(500, 180)
        await braco.run_angle(500, -180)

    anx.state("missao", "m1_volta")
    await robo.turn(-90)
    await robo.straight(-500)
    anx.event("missao_concluida", 1)


async def sensores():
    # Telemetria contínua enquanto a missão anda.
    while True:
        anx.value("heading", hub.imu.heading())
        anx.value("distancia_mm", robo.distance())
        await wait(100)


async def principal():
    tempo = StopWatch()
    await multitask(missao_1(), sensores(), anx.keep_alive(), race=True)
    anx.value("tempo_total_ms", tempo.time())
    anx.log("fim das missões")


run_task(principal())
